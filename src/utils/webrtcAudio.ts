export interface WebRTCCallCallbacks {
  sendSignal: (payload: any) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'live_audio' | 'text_fallback') => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

export class WebRTCAudioSession {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private callId: string = '';
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private callbacks: WebRTCCallCallbacks;

  constructor(callbacks: WebRTCCallCallbacks) {
    this.callbacks = callbacks;
  }

  private createPeerConnection(callId: string): RTCPeerConnection {
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
    }
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.sendSignal({
          type: 'webrtc:ice',
          callId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!stream) return;
      this.callbacks.onRemoteStream?.(stream);
      this.attachRemoteAudio(stream);
      this.callbacks.onStatusChange?.('live_audio');
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.callbacks.onStatusChange?.('live_audio');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.callbacks.onStatusChange?.('text_fallback');
      }
    };

    this.pc = pc;
    return pc;
  }

  private attachRemoteAudio(stream: MediaStream) {
    if (typeof document === 'undefined') return;
    if (!this.remoteAudio) {
      const el = document.createElement('audio');
      el.autoplay = true;
      el.setAttribute('playsinline', 'true');
      el.style.display = 'none';
      document.body.appendChild(el);
      this.remoteAudio = el;
    }
    this.remoteAudio.srcObject = stream;
    this.remoteAudio.play().catch(() => {});
  }

  private async getMicStream(): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.localStream = stream;
      return stream;
    } catch {
      return null;
    }
  }

  async startAsCaller(callId: string) {
    if (!callId || typeof RTCPeerConnection === 'undefined') {
      this.callbacks.onStatusChange?.('text_fallback');
      return;
    }
    this.callId = callId;
    this.pendingIceCandidates = [];
    this.callbacks.onStatusChange?.('connecting');

    const stream = await this.getMicStream();
    if (!stream) {
      this.callbacks.onStatusChange?.('text_fallback');
      return;
    }

    const pc = this.createPeerConnection(callId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      this.callbacks.sendSignal({
        type: 'webrtc:offer',
        callId,
        sdp: offer
      });
    } catch {
      this.callbacks.onStatusChange?.('text_fallback');
    }
  }

  async handleIncomingOffer(callId: string, sdp: RTCSessionDescriptionInit) {
    if (!callId || typeof RTCPeerConnection === 'undefined') {
      this.callbacks.onStatusChange?.('text_fallback');
      return;
    }
    this.callId = callId;
    this.callbacks.onStatusChange?.('connecting');

    const pc = this.createPeerConnection(callId);
    const stream = await this.getMicStream();
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      for (const cand of this.pendingIceCandidates) {
        await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
      }
      this.pendingIceCandidates = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.callbacks.sendSignal({
        type: 'webrtc:answer',
        callId,
        sdp: answer
      });
      if (stream) {
        this.callbacks.onStatusChange?.('live_audio');
      } else {
        this.callbacks.onStatusChange?.('text_fallback');
      }
    } catch {
      this.callbacks.onStatusChange?.('text_fallback');
    }
  }

  async handleIncomingAnswer(callId: string, sdp: RTCSessionDescriptionInit) {
    if (!this.pc || this.callId !== callId) return;
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      for (const cand of this.pendingIceCandidates) {
        await this.pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
      }
      this.pendingIceCandidates = [];
      this.callbacks.onStatusChange?.('live_audio');
    } catch {
      this.callbacks.onStatusChange?.('text_fallback');
    }
  }

  async handleIncomingIce(callId: string, candidate: RTCIceCandidateInit) {
    if (!candidate || this.callId !== callId) return;
    if (this.pc && this.pc.remoteDescription) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    } else {
      this.pendingIceCandidates.push(candidate);
    }
  }

  setMuted(muted: boolean) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  close(notifyPeer = false) {
    if (notifyPeer && this.callId) {
      this.callbacks.sendSignal({ type: 'webrtc:hangup', callId: this.callId });
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    if (this.remoteAudio) {
      try {
        this.remoteAudio.pause();
        this.remoteAudio.srcObject = null;
        this.remoteAudio.remove();
      } catch {}
      this.remoteAudio = null;
    }
    this.callId = '';
    this.pendingIceCandidates = [];
    this.callbacks.onStatusChange?.('idle');
  }
}
