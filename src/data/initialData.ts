import {
  Product,
  Order,
  StoreSettings,
  DistrictInfo,
  Category,
  HomeSlide,
  AbandonedCart,
  UserStaff,
  ProductReview
} from '../types';

// All 64 Districts in Bangladesh
export const BD_DISTRICTS: DistrictInfo[] = [
  // Dhaka Metro
  {
    name: 'Dhaka - Inside City',
    nameBn: 'ঢাকা (সিটি কর্পোরেশন)',
    zone: 'dhaka_inside',
    thanas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Badda', 'Khilgaon', 'Bashundhara R/A', 'Farmgate', 'Lalbagh', 'Old Dhaka', 'Tejgaon', 'Paltan', 'Rampura', 'Malibagh', 'Wari', 'Jatrabari', 'Shahbagh', 'Mohakhali']
  },
  // Sub-Dhaka
  {
    name: 'Gazipur (Dhaka Suburb)',
    nameBn: 'গাজীপুর (ঢাকা উপশহর)',
    zone: 'dhaka_sub',
    thanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj']
  },
  {
    name: 'Narayanganj (Dhaka Suburb)',
    nameBn: 'নারায়ণগঞ্জ (ঢাকা উপশহর)',
    zone: 'dhaka_sub',
    thanas: ['Narayanganj Sadar', 'Fatullah', 'Siddhirganj', 'Rupganj', 'Sonargaon', 'Araihazar', 'Bandar']
  },
  {
    name: 'Savar & Keraniganj',
    nameBn: 'সাভার ও কেরানীগঞ্জ',
    zone: 'dhaka_sub',
    thanas: ['Savar Sadar', 'Ashulia', 'Hemayetpur', 'Keraniganj South', 'Keraniganj North', 'Dhamrai']
  },
  // Dhaka Division Others
  { name: 'Narsingdi', nameBn: 'নরসিংদী', zone: 'dhaka_outside', thanas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura'] },
  { name: 'Manikganj', nameBn: 'মানিকগঞ্জ', zone: 'dhaka_outside', thanas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Shibalaya', 'Ghior', 'Daulatpur', 'Harirampur'] },
  { name: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', zone: 'dhaka_outside', thanas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Lohajang', 'Tongibari', 'Gazaria'] },
  { name: 'Tangail', nameBn: 'টাঙ্গাইল', zone: 'dhaka_outside', thanas: ['Tangail Sadar', 'Mirzapur', 'Kalihati', 'Madhupur', 'Ghatail', 'Sakhipur', 'Basail'] },
  { name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', zone: 'dhaka_outside', thanas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Kuliarchar', 'Pakundia', 'Karimganj'] },
  { name: 'Faridpur', nameBn: 'ফরিদপুর', zone: 'dhaka_outside', thanas: ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Nagarkanda', 'Madhukhali', 'Sadarpur'] },
  { name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', zone: 'dhaka_outside', thanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
  { name: 'Madaripur', nameBn: 'মাদারীপুর', zone: 'dhaka_outside', thanas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir'] },
  { name: 'Rajbari', nameBn: 'রাজবাড়ী', zone: 'dhaka_outside', thanas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali'] },
  { name: 'Shariatpur', nameBn: 'শরীয়তপুর', zone: 'dhaka_outside', thanas: ['Shariatpur Sadar', 'Zajira', 'Naria', 'Bhedarganj', 'Damudya', 'Gosairhat'] },

  // Chattogram Division
  { name: 'Chattogram', nameBn: 'চট্টগ্রাম', zone: 'dhaka_outside', thanas: ['Chittagong Sadar', 'Agrabad', 'Nasirabad', 'Pahartali', 'Halishahar', 'Patiya', 'Sitakunda', 'Hathazari', 'Mirsharai', 'Raozan', 'Fatikchhari', 'Anwara', 'Chandanaish', 'Boalkhali'] },
  { name: 'Cox\'s Bazar', nameBn: 'কক্সবাজার', zone: 'dhaka_outside', thanas: ['Cox\'s Bazar Sadar', 'Teknaf', 'Ukhia', 'Chakaria', 'Ramu', 'Maheshkhali', 'Pekua'] },
  { name: 'Cumilla', nameBn: 'কুমিল্লা', zone: 'dhaka_outside', thanas: ['Cumilla Sadar', 'Laksam', 'Debidwar', 'Burichang', 'Brahmanpara', 'Chandina', 'Chauddagram', 'Daudkandi', 'Homna', 'Muradnagar'] },
  { name: 'Feni', nameBn: 'ফেনী', zone: 'dhaka_outside', thanas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Parshuram', 'Sonagazi', 'Fulgazi'] },
  { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', zone: 'dhaka_outside', thanas: ['Brahmanbaria Sadar', 'Ashuganj', 'Sarail', 'Nasirnagar', 'Nabinagar', 'Bancharampur', 'Kasba', 'Akhaura'] },
  { name: 'Noakhali', nameBn: 'নোয়াখালী', zone: 'dhaka_outside', thanas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companyganj', 'Hatiya', 'Senbagh', 'Subarnachar', 'Kabirhat'] },
  { name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', zone: 'dhaka_outside', thanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
  { name: 'Chandpur', nameBn: 'চাঁদপুর', zone: 'dhaka_outside', thanas: ['Chandpur Sadar', 'Hajiganj', 'Matlab North', 'Matlab South', 'Shahrasti', 'Faridganj', 'Haimchar', 'Kachua'] },
  { name: 'Bandarban', nameBn: 'বান্দরবান', zone: 'dhaka_outside', thanas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Lama', 'Alikadam', 'Naikhongchhari', 'Rowangchhari'] },
  { name: 'Rangamati', nameBn: 'রাঙ্গামাটি', zone: 'dhaka_outside', thanas: ['Rangamati Sadar', 'Kaptai', 'Baghaichhari', 'Barkal', 'Langadu', 'Juraichhari', 'Naniarchar'] },
  { name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', zone: 'dhaka_outside', thanas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh'] },

  // Sylhet Division
  { name: 'Sylhet', nameBn: 'সিলেট', zone: 'dhaka_outside', thanas: ['Sylhet Sadar', 'Amberkhana', 'Zindabazar', 'South Surma', 'Beanibazar', 'Golapganj', 'Zakiganj', 'Kanaighat', 'Fenchuganj', 'Balaganj', 'Biswanath', 'Companiganj', 'Gowainghat', 'Jaintiapur'] },
  { name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', zone: 'dhaka_outside', thanas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Kamalganj', 'Barlekha', 'Rajnagar', 'Juri'] },
  { name: 'Habiganj', nameBn: 'হবিগঞ্জ', zone: 'dhaka_outside', thanas: ['Habiganj Sadar', 'Madhabpur', 'Nabiganj', 'Bahubal', 'Chunarughat', 'Baniachong', 'Ajmiriganj', 'Lakhai'] },
  { name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', zone: 'dhaka_outside', thanas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Dharampasha', 'Tahirpur', 'Jamalganj', 'Shantiganj'] },

  // Rajshahi Division
  { name: 'Rajshahi', nameBn: 'রাজশাহী', zone: 'dhaka_outside', thanas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Paba', 'Godagari', 'Bagmara', 'Charghat', 'Durgapur', 'Puthia', 'Tanore'] },
  { name: 'Bogura', nameBn: 'বগুড়া', zone: 'dhaka_outside', thanas: ['Bogura Sadar', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Gabtali', 'Kahalu', 'Nandigram', 'Sariakandi', 'Sonatola', 'Dhunat', 'Adamdighi', 'Dupchanchia'] },
  { name: 'Pabna', nameBn: 'পাবনা', zone: 'dhaka_outside', thanas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Bera', 'Sujanagar', 'Chatmohar', 'Faridpur', 'Atgharia', 'Bhangura'] },
  { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', zone: 'dhaka_outside', thanas: ['Sirajganj Sadar', 'Shahjadpur', 'Ullapara', 'Belkuchi', 'Kazipur', 'Kamarkhanda', 'Raiganj', 'Tarash', 'Chauhali'] },
  { name: 'Naogaon', nameBn: 'নওগাঁ', zone: 'dhaka_outside', thanas: ['Naogaon Sadar', 'Mohadevpur', 'Patnitala', 'Dhamoirhat', 'Manda', 'Niamatpur', 'Raninagar', 'Atrai', 'Badalgachhi', 'Porsha', 'Sapahar'] },
  { name: 'Natore', nameBn: 'নাটোর', zone: 'dhaka_outside', thanas: ['Natore Sadar', 'Baraigram', 'Bagatipara', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'] },
  { name: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', zone: 'dhaka_outside', thanas: ['Nawabganj Sadar', 'Shibganj', 'Bholahat', 'Gomastapur', 'Nachole'] },
  { name: 'Joypurhat', nameBn: 'জয়পুরহাট', zone: 'dhaka_outside', thanas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur'] },

  // Khulna Division
  { name: 'Khulna', nameBn: 'খুলনা', zone: 'dhaka_outside', thanas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Dumuria', 'Rupsha', 'Phultala', 'Batiaghata', 'Dacope', 'Koyra', 'Paikgachha', 'Terokhada'] },
  { name: 'Jashore', nameBn: 'যশোর', zone: 'dhaka_outside', thanas: ['Jashore Sadar', 'Jhikargachha', 'Sharsha', 'Manirampur', 'Chaugachha', 'Keshabpur', 'Bagherpara', 'Abhaynagar'] },
  { name: 'Kushtia', nameBn: 'কুষ্টিয়া', zone: 'dhaka_outside', thanas: ['Kushtia Sadar', 'Kumarkhali', 'Bheramara', 'Mirpur', 'Khoksa', 'Daulatpur'] },
  { name: 'Satkhira', nameBn: 'সাতক্ষীরা', zone: 'dhaka_outside', thanas: ['Satkhira Sadar', 'Kalaroa', 'Tala', 'Kaliganj', 'Shyamnagar', 'Assasuni', 'Debhata'] },
  { name: 'Bagerhat', nameBn: 'বাগেরহাট', zone: 'dhaka_outside', thanas: ['Bagerhat Sadar', 'Mongla', 'Fakirhat', 'Kachua', 'Mollahat', 'Rampal', 'Morrelganj', 'Sarankhola', 'Chitalmari'] },
  { name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', zone: 'dhaka_outside', thanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
  { name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', zone: 'dhaka_outside', thanas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Harinakunda'] },
  { name: 'Magura', nameBn: 'মাগুরা', zone: 'dhaka_outside', thanas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'] },
  { name: 'Meherpur', nameBn: 'মেহেরপুর', zone: 'dhaka_outside', thanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
  { name: 'Narail', nameBn: 'নড়াইল', zone: 'dhaka_outside', thanas: ['Narail Sadar', 'Lohagara', 'Kalia'] },

  // Barishal Division
  { name: 'Barishal', nameBn: 'বরিশাল', zone: 'dhaka_outside', thanas: ['Barishal Sadar', 'Kotwali', 'Babuganj', 'Bakerganj', 'Gournadi', 'Banaripara', 'Agailjhara', 'Muladi', 'Hizla', 'Mehendiganj', 'Wazirpur'] },
  { name: 'Bhola', nameBn: 'ভোলা', zone: 'dhaka_outside', thanas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
  { name: 'Patuakhali', nameBn: 'পটুয়াখালী', zone: 'dhaka_outside', thanas: ['Patuakhali Sadar', 'Bauphal', 'Galachipa', 'Dashmina', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali'] },
  { name: 'Pirojpur', nameBn: 'পিরোজপুর', zone: 'dhaka_outside', thanas: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Kawkhali', 'Nazirpur', 'Nesarabad (Swarupkathi)', 'Indurkani'] },
  { name: 'Barguna', nameBn: 'বরগুনা', zone: 'dhaka_outside', thanas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi', 'Bamna', 'Taltali'] },
  { name: 'Jhalokathi', nameBn: 'ঝালকাঠি', zone: 'dhaka_outside', thanas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },

  // Rangpur Division
  { name: 'Rangpur', nameBn: 'রংপুর', zone: 'dhaka_outside', thanas: ['Rangpur Sadar', 'Kotwali', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
  { name: 'Dinajpur', nameBn: 'দিনাজপুর', zone: 'dhaka_outside', thanas: ['Dinajpur Sadar', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Fulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'] },
  { name: 'Gaibandha', nameBn: 'গাইবান্ধা', zone: 'dhaka_outside', thanas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj', 'Phulchhari'] },
  { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', zone: 'dhaka_outside', thanas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Rowmari', 'Char Rajibpur'] },
  { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', zone: 'dhaka_outside', thanas: ['Lalmonirhat Sadar', 'Aditmari', 'Kaliganj', 'Hatibandha', 'Patgram'] },
  { name: 'Nilphamari', nameBn: 'নীলফামারী', zone: 'dhaka_outside', thanas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Dimla', 'Jaldhaka', 'Kishoreganj'] },
  { name: 'Panchagarh', nameBn: 'পঞ্চগড়', zone: 'dhaka_outside', thanas: ['Panchagarh Sadar', 'Boda', 'Debiganj', 'Atwari', 'Tetulia'] },
  { name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', zone: 'dhaka_outside', thanas: ['Thakurgaon Sadar', 'Pirganj', 'Baliadangi', 'Ranisankail', 'Haripur'] },

  // Mymensingh Division
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', zone: 'dhaka_outside', thanas: ['Mymensingh Sadar', 'Kotwali', 'Bhaluka', 'Trishal', 'Muktagachha', 'Fulbaria', 'Gaffargaon', 'Haluaghat', 'Ishwarganj', 'Nandail', 'Phulpur', 'Tarakanda', 'Dhobaura'] },
  { name: 'Jamalpur', nameBn: 'জামালপুর', zone: 'dhaka_outside', thanas: ['Jamalpur Sadar', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari', 'Bakshiganj'] },
  { name: 'Netrokona', nameBn: 'নেত্রকোণা', zone: 'dhaka_outside', thanas: ['Netrokona Sadar', 'Barhatta', 'Durgapur', 'Kendua', 'Kalmakanda', 'Madan', 'Mohanganj', 'Purbadhala', 'Khaliajuri', 'Atpara'] },
  { name: 'Sherpur', nameBn: 'শেরপুর', zone: 'dhaka_outside', thanas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi'] }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'smart-gadgets', nameBn: 'স্মার্ট গ্যাজেট', nameEn: 'Smart Gadgets', slug: 'smart-gadgets', icon: 'Watch', isActive: true, order: 1 },
  { id: 'fashion', nameBn: 'ফ্যাশন ও লাইফস্টাইল', nameEn: 'Fashion & Lifestyle', slug: 'fashion', icon: 'Shirt', isActive: true, order: 2 },
  { id: 'organic-food', nameBn: 'অর্গানিক ফুড ও মধু', nameEn: 'Organic Foods & Honey', slug: 'organic-food', icon: 'Apple', isActive: true, order: 3 },
  { id: 'home-kitchen', nameBn: 'হোম ও কিচেন', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: 'Home', isActive: true, order: 4 },
  { id: 'islamic-lifestyle', nameBn: 'ইসলামিক ও আতর', nameEn: 'Islamic & Attar', slug: 'islamic-lifestyle', icon: 'Moon', isActive: true, order: 5 },
  { id: 'beauty-care', nameBn: 'বিউটি ও পার্সোনাল কেয়ার', nameEn: 'Beauty & Personal Care', slug: 'beauty-care', icon: 'Sparkles', isActive: true, order: 6 }
];

export const INITIAL_SLIDERS: HomeSlide[] = [
  {
    id: 'slide-1',
    titleBn: 'সুপার ডিল: আল্ট্রা স্মার্টওয়াচ ও গ্যাজেট কালেকশন',
    titleEn: 'Super Deal: Ultra Smartwatch & Gadgets Collection',
    subtitleBn: 'ব্লুটুথ কলিং, হার্ট রেট ও মেটাল স্ট্র্যাপ সহ ৬৫% বিশেষ ছাড়ে কিনুন',
    subtitleEn: 'Bluetooth calling, heart-rate monitor with 65% mega discount',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
    buttonTextBn: '১ ক্লিকে এখনই কিনুন',
    buttonTextEn: '1-Click Buy Now',
    linkCategory: 'smart-gadgets',
    discountBadgeBn: '৬৫% মেগা অফার',
    discountBadgeEn: '65% Mega Offer',
    isActive: true
  },
  {
    id: 'slide-2',
    titleBn: 'সুন্দরবনের ১০০% খাঁটি প্রাকৃতিক খলিশা ফুলের মধু',
    titleEn: '100% Pure Raw Sundarban Wild Honey',
    subtitleBn: 'কোনো প্রকার চিনি বা প্রিজারভেটিভ ছাড়া ল্যাব টেস্টে শতভাগ খাঁটি',
    subtitleEn: 'Lab certified zero sugar wild honey directly from forest',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=80',
    buttonTextBn: 'খাঁটি মধু অর্ডার করুন',
    buttonTextEn: 'Order Pure Honey',
    linkCategory: 'organic-food',
    discountBadgeBn: '১০০% অরিজিনাল গ্যারান্টি',
    discountBadgeEn: '100% Pure Guarantee',
    isActive: true
  },
  {
    id: 'slide-3',
    titleBn: 'প্রিমিয়াম রয়্যাল কটন এমব্রয়ডারি পাঞ্জাবি ও পায়জামা সেট',
    titleEn: 'Premium Royal Cotton Embroidered Panjabi Set',
    subtitleBn: '১০০% ফাইন সুতি কাপড়ে নিখুঁত এমব্রয়ডারি কাজ ও এলিগ্যান্ট ফিটিং',
    subtitleEn: '100% fine breathable cotton with royal handcrafted embroidery',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
    buttonTextBn: 'কালেকশন দেখুন',
    buttonTextEn: 'View Collection',
    linkCategory: 'fashion',
    discountBadgeBn: 'সীমিত স্টক',
    discountBadgeEn: 'Limited Stock',
    isActive: true
  },
  {
    id: 'slide-4',
    titleBn: 'স্মার্ট কিচেন কাটার ও ১৪-ইন-১ মাল্টি চপার গ্যাজেট',
    titleEn: '14-in-1 Smart Multifunctional Kitchen Vegetable Cutter',
    subtitleBn: 'রান্নার সময় অর্ধেক করতে আল্ট্রা শার্প স্টেইনলেস স্টিল কিচেন কাটার',
    subtitleEn: 'Heavy duty blades with instant drainage container basket',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    buttonTextBn: 'অফারটি লুফে নিন',
    buttonTextEn: 'Grab Kitchen Deal',
    linkCategory: 'home-kitchen',
    discountBadgeBn: '৳৪৫০ ছাড়',
    discountBadgeEn: '৳450 Discount',
    isActive: true
  },
  {
    id: 'slide-5',
    titleBn: 'মদিনার খাঁটি জান্নাতুল ফেরদৌস প্রিমিয়াম রোল-অন আতর',
    titleEn: 'Jannatul Ferdous Alcohol-Free Pure Perfume Oil (Attar)',
    subtitleBn: '৪৮ ঘণ্টারও বেশি স্থায়ী সুরভিময় মিষ্টি সুগন্ধিযুক্ত ১০০% হালাল আতর',
    subtitleEn: '48+ hours long lasting royal oriental alcohol-free attar',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=80',
    buttonTextBn: 'আতর সংগ্রহ করুন',
    buttonTextEn: 'Explore Attar',
    linkCategory: 'islamic-lifestyle',
    discountBadgeBn: 'হট ডিল',
    discountBadgeEn: 'Hot Deal',
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Ultra Watch 9 Pro AMOLED Display Smartwatch with Calling',
    titleBn: 'আল্ট্রা ওয়াচ ৯ প্রো এমোলেড ডিসপ্লে স্মার্টওয়াচ (কলিং ও হেলথ ট্র্যাকার)',
    description: 'Next-gen flagship smartwatch with vibrant 2.1-inch Always-on AMOLED screen, wireless magnetic charging, wireless Bluetooth call answering, water-resistant zinc-alloy body, and 100+ sports modes.',
    descriptionBn: 'অরিজিনাল ২.১ ইঞ্চি এমোলেড ডিসপ্লে, ব্লুটুথ কল রিসিভ ও ডায়ালিং, হার্ট রেট ও স্লিপ মনিটরিং সমৃদ্ধ প্রিমিয়াম স্মার্টওয়াচ। সাথে অতিরিক্ত অরেঞ্জ সিলিকন ও ওশান স্ট্র্যাপ সম্পূর্ণ ফ্রি।',
    price: 1850,
    originalPrice: 3500,
    stock: 35,
    category: 'smart-gadgets',
    categoryBn: 'স্মার্ট গ্যাজেট',
    tags: ['Best Seller', 'Hot Deal', 'Free Delivery'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'WATCH9-PRO-BLK',
    rating: 4.9,
    reviewsCount: 342,
    isFlashSale: true,
    colors: ['Titanium Silver (সিলভার)', 'Matte Black (কালো)', 'Deep Orange (কমলা)'],
    sizes: ['49mm Standard'],
    features: ['2.1 Inch HD AMOLED Display', 'Direct Bluetooth Calling & Mic', 'Wireless Fast Magnetic Charger', 'IP68 Waterproof Body', '7 Days Battery Backup'],
    featuresBn: ['২.১ ইঞ্চি এইচডি ক্রিস্টাল এমোলেড স্ক্রিন', 'সরাসরি ব্লুটুথ কলিং ও লাউডস্পিকার', 'ম্যাগনেটিক ফাস্ট চার্জার', 'আইপি৬৮ ওয়াটারপ্রুফ বডি', 'এক চার্জে ৫-৭ দিন দীর্ঘস্থায়ী ব্যাটারি'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    warrantyInfo: '1 Year Brand Warranty & 7 Days Replacement',
    warrantyInfoBn: '১ বছরের ব্র্যান্ড সার্ভিস ও ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'
  },
  {
    id: 'prod-002',
    title: 'T9 Vintage Professional Hair & Beard Trimmer for Men',
    titleBn: 'T9 ভিন্টেজ প্রফেশনাল মেটাল হেয়ার ও বিয়ার্ড ট্রিমার (ইউএসবি রিচার্জেবল)',
    description: 'Heavy duty dragon carved metal hair clipper trimmer for professional styling and zero trim grooming with ultra-sharp stainless steel T-blade.',
    descriptionBn: 'সম্পূর্ণ মেটাল বডি ও রাজকীয় ড্রাগন খোদাই করা টি৯ হেয়ার ও দাড়ি ট্রিমার। ইউএসবি রিচার্জেবল লিথিয়াম ব্যাটারি ও ৪টি ক্লিপ কম্ব সহ।',
    price: 790,
    originalPrice: 1400,
    stock: 62,
    category: 'smart-gadgets',
    categoryBn: 'স্মার্ট গ্যাজেট',
    tags: ['Mega Offer', 'Trending'],
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'T9-TRIMMER-GLD',
    rating: 4.8,
    reviewsCount: 228,
    isFlashSale: true,
    colors: ['Vintage Golden (স্বর্ণালী)', 'Classic Bronze (ব্রোঞ্জ)', 'Silver Metallic (রুপালি)'],
    sizes: ['Standard'],
    features: ['Zero Gapped T-Blade', 'Full Heavy Metal Body', '1200mAh Rechargeable Battery', '4 Guide Combs Included'],
    featuresBn: ['জিরো ট্রিম শার্প টি-ব্লেড', 'সম্পূর্ণ মেটাল ড্রাগন বডি', '১২০০ এমএএইচ রিচার্জেবল ব্যাটারি', '৪টি কাটিং কম্ব (১.৫মিমি, ২মিমি, ৩মিমি, ৪মিমি)']
  },
  {
    id: 'prod-003',
    title: 'Royal Handcrafted Cotton Panjabi Set with Exclusive Embroidery',
    titleBn: 'রয়্যাল ফাইন কটন এমব্রয়ডারি পাঞ্জাবি ও পায়জামা সেট',
    description: 'Premium tailored formal and festive Panjabi crafted with 100% breathable organic fine cotton fabric with intricate chest embroidery.',
    descriptionBn: 'শতভাগ প্রিমিয়াম ফাইন সুতি কাপড়ে তৈরি রাজকীয় ডিজাইনের পাঞ্জাবি। নিখুঁত সুতার কাজ এবং আরামদায়ক কাট। যেকোনো উৎসবে পরার জন্য সেরা।',
    price: 1850,
    originalPrice: 2800,
    stock: 28,
    category: 'fashion',
    categoryBn: 'ফ্যাশন ও লাইফস্টাইল',
    tags: ['Exclusive', 'Eid Special'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'PANJABI-ROYAL-03',
    rating: 4.9,
    reviewsCount: 189,
    isFlashSale: false,
    colors: ['Navy Blue (নেভি ব্লু)', 'Snow White (সাদা)', 'Olive Green (অলিভ গ্রিন)', 'Jet Black (কালো)'],
    sizes: ['40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
    features: ['100% Breathable Fine Cotton', 'High-Grade Thread Embroidery', 'Snap Metal Buttons', 'Color Fade Resistant'],
    featuresBn: ['১০০% নরম ফাইন সুতি কাপড়', 'নিখুঁত সুতার এমব্রয়ডারি কাজ', 'ম্যাচিং স্ন্যাপ বাটন', 'রং ওঠার ভয় নেই']
  },
  {
    id: 'prod-004',
    title: 'M10 TWS Wireless Earbuds with 2000mAh Power Bank Case',
    titleBn: 'M10 ব্লুটুথ ৫.১ ওয়্যারলেস ইয়ারবাডস (পাওয়ারব্যাংক ডিসপ্লে সহ)',
    description: 'Deep bass Bluetooth 5.1 earphones with 9D stereo sound, LED digital battery display case that can also charge your mobile in emergencies.',
    descriptionBn: '৯ডি স্টেরিও সাউন্ড ও চমৎকার বেইস সমৃদ্ধ এম১০ ইয়ারবাডস। ডিজিটাল এলইডি পারসেন্টেজ ডিসপ্লে ও মোবাইল চার্জিং পাওয়ারব্যাংক কেস।',
    price: 690,
    originalPrice: 1200,
    stock: 90,
    category: 'smart-gadgets',
    categoryBn: 'স্মার্ট গ্যাজেট',
    tags: ['Super Deal', 'Power Bank Case'],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'M10-TWS-BLK',
    rating: 4.6,
    reviewsCount: 512,
    isFlashSale: true,
    colors: ['Glossy Black (কালো)'],
    sizes: ['Standard'],
    features: ['9D Hi-Fi Sound', 'Digital Battery Level Indicator', 'Touch Controls', 'Can Charge Mobile Device'],
    featuresBn: ['হাই-ফাই ৯ডি স্টেরিও বেইস', 'ডিজিটাল চার্জিং পার্সেন্টেজ', 'ফিঙ্গারপ্রিন্ট টাচ কন্ট্রোল', 'জরুরি প্রয়োজনে মোবাইল চার্জ সুবিধা']
  },
  {
    id: 'prod-005',
    title: 'Sundarban Raw Natural Khalisha Pure Honey (1 Kg)',
    titleBn: 'সুন্দরবনের ১০০% খাঁটি খলিশা ফুলের প্রাকৃতিক মধু (১ কেজি)',
    description: '100% natural, unpasteurized, lab-tested wild honey directly sourced from Sundarban mangrove forest. Rich in antioxidants and authentic floral aroma.',
    descriptionBn: 'সুন্দরবনের গভীর জঙ্গল থেকে মোয়ালদের সংগৃহীত ১০০% খাঁটি ও প্রক্রিয়াজাতহীন খলিশা ফুলের মধু। রোগ প্রতিরোধ ক্ষমতা বাড়ায়।',
    price: 1150,
    originalPrice: 1500,
    stock: 24,
    category: 'organic-food',
    categoryBn: 'অর্গানিক ফুড ও মধু',
    tags: ['100% Pure', 'Lab Tested'],
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'HONEY-SUNDAR-1KG',
    rating: 5.0,
    reviewsCount: 97,
    isFlashSale: false,
    colors: ['Pure Golden Amber'],
    sizes: ['1 Kg Glass Jar (১ কেজি)', '500g Glass Jar (৫০০ গ্রাম)'],
    features: ['Directly From Sundarban', 'No Added Sugar Or Glucose', 'Rich In Natural Enzymes', 'Heavy Glass Jar Packaging'],
    featuresBn: ['সরাসরি সুন্দরবন থেকে সংগৃহীত', 'চিনি বা গ্লুকোজ মুক্ত শতভাগ খাঁটি', 'প্রাকৃতিক এনজাইম ও অ্যান্টিঅক্সিডেন্ট', 'সুরক্ষিত প্রিমিয়াম কাঁচের জার']
  },
  {
    id: 'prod-006',
    title: '14-in-1 Multifunctional Vegetable Cutter & Food Chopper',
    titleBn: '১৪-ইন-১ মাল্টিফাংশনাল ভেজিটেবল ও কিচেন কাটার',
    description: 'Save cooking preparation time with sharp stainless steel blades for slicing, dicing, grating onions, potatoes, carrots with drainage container basket.',
    descriptionBn: 'রান্নার সময় অর্ধেক করতে আল্ট্রা-শার্প স্টেইনলেস স্টিল ব্লেড সহ ১৪ ধরনের কাটিং ও ড্রেন বাস্কেট যুক্ত স্মার্ট কিচেন কাটার।',
    price: 950,
    originalPrice: 1600,
    stock: 55,
    category: 'home-kitchen',
    categoryBn: 'হোম ও কিচেন',
    tags: ['Kitchen Must Have'],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'CHOPPER-14IN1',
    rating: 4.7,
    reviewsCount: 146,
    isFlashSale: true,
    colors: ['Emerald Green & Grey'],
    sizes: ['Standard Set'],
    features: ['14 Interchangeable Blades', 'Large Catch Tray with Drain Basket', 'Food Grade BPA-Free Plastic', 'Hand Safety Guard Included'],
    featuresBn: ['১৪ রকমের স্টেইনলেস স্টিল ব্লেড', 'ড্রেনেজ বাস্কেট সহ ১.৫ লিটার কন্টেইনার', 'বিপিএ-ফ্রি ফুড গ্রেড প্লাস্টিক', 'হাত কাটার ভয়হীন হ্যান্ডগার্ড']
  },
  {
    id: 'prod-007',
    title: 'Madina Pure Jannatul Ferdous Alcohol-Free Concentrated Attar (12ml)',
    titleBn: 'মদিনার খাঁটি জান্নাতুল ফেরদৌস এলকোহল-মুক্ত পারফিউম আতর (১২ মিলি)',
    description: 'Long-lasting authentic oriental fragrance oil imported from holy Madinah. Free from alcohol and chemical additives with 48 hours lingering smell.',
    descriptionBn: 'মদিনার ঐতিহ্যবাহী জান্নাতুল ফেরদৌস কনসেনট্রেটেড হালাল আতর। দীর্ঘ ৪৮ ঘণ্টারও বেশি সময় পর্যন্ত কাপড়ে প্রশান্তিময় সুবাস ছড়ায়।',
    price: 590,
    originalPrice: 950,
    stock: 80,
    category: 'islamic-lifestyle',
    categoryBn: 'ইসলামিক ও আতর',
    tags: ['Halal', 'Long Lasting'],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'ATTAR-JANNAT-12ML',
    rating: 4.9,
    reviewsCount: 310,
    isFlashSale: false,
    colors: ['Amber Crystal Glass Bottle'],
    sizes: ['12ml Roll-On (১২ মিলি)', '6ml Pocket (৬ মিলি)'],
    features: ['100% Alcohol Free Pure Concentrated Oil', '48+ Hours Lasting Scent', 'Luxurious Crystal Roll-on Bottle', 'Made from Natural Floral Extracts'],
    featuresBn: ['শতভাগ অ্যালকোহল ও কেমিক্যাল মুক্ত', '৪৮+ ঘণ্টা দীর্ঘস্থায়ী সুবাস', 'প্রিমিয়াম ক্রিস্টাল কাঁচের শিশি', 'প্রাকৃতিক ফুলের নির্যাস থেকে প্রস্তুত']
  },
  {
    id: 'prod-008',
    title: 'Rice Water Brightening Gentle Foaming Cleanser (150ml)',
    titleBn: 'রাইস ওয়াটার ব্রাইটেনিং ফেসওয়াশ ও ডিপ পোর ক্লিনজার (১৫০ মিলি)',
    description: 'Deep cleansing face wash enriched with real rice water and moringa oil to gently dissolve impurities and brighten dull skin tone.',
    descriptionBn: 'প্রাকৃতিক চালের নির্যাস ও ভিটামিন সমৃদ্ধ ফেসওয়াশ। ত্বকের গভীর থেকে ময়লা পরিষ্কার করে ইনস্ট্যান্ট উজ্জ্বলতা ফিরিয়ে আনে।',
    price: 750,
    originalPrice: 1100,
    stock: 40,
    category: 'beauty-care',
    categoryBn: 'বিউটি ও পার্সোনাল কেয়ার',
    tags: ['Natural Glow', 'Korean Formula'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'CLEANSER-RICE-150',
    rating: 4.8,
    reviewsCount: 164,
    isFlashSale: false,
    colors: ['Milky White'],
    sizes: ['150ml'],
    features: ['Infused with Rice Water and Moringa Oil', 'For All Skin Types', 'Sulfate and Paraben Free', 'Gentle Daily Use'],
    featuresBn: ['চালের খাঁটি নির্যাস ও ভিটামিন সমৃদ্ধ', 'সব ধরনের ত্বকের জন্য উপযোগী', 'প্যারাবেন ও ক্ষতিকর কেমিক্যাল মুক্ত', 'নরম ও উজ্জ্বল ত্বকের নিশ্চয়তা']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'BD-89210',
    customer: {
      name: 'তানভীর আহমেদ',
      phone: '01711223344',
      address: 'বাড়ি #১২, রোড #০৫, ব্লক #সি, বনশ্রী',
      district: 'ঢাকা (সিটি কর্পোরেশন)',
      thana: 'Rampura',
      note: 'কল করে ডেলিভারি দিবেন'
    },
    items: [
      {
        productId: 'prod-001',
        productTitle: 'Ultra Watch 9 Pro AMOLED Display Smartwatch',
        productTitleBn: 'আল্ট্রা ওয়াচ ৯ প্রো এমোলেড ডিসপ্লে স্মার্টওয়াচ',
        price: 1850,
        quantity: 1,
        selectedColor: 'Titanium Silver (সিলভার)',
        selectedSize: '49mm Standard',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
      }
    ],
    pricing: {
      subtotal: 1850,
      deliveryFee: 70,
      discount: 100,
      total: 1820
    },
    payment: {
      method: 'cod',
      status: 'pending'
    },
    deliveryZone: 'dhaka_inside',
    status: 'ai_confirmed',
    aiCallStatus: {
      called: true,
      callTimestamp: 'Today 10:15 AM',
      confirmedByCustomer: true,
      durationSeconds: 38,
      notes: 'Customer confirmed order verbally via automated voice prompt (pressed 1)',
      transcript: [
        { speaker: 'ai', text: 'Assalamu Alaikum Tanvir bhai, calling from BuyOne BD...', textBn: 'আসসালামু আলাইকুম তানভীর ভাই, BuyOne BD থেকে বলছি...', time: '00:02' },
        { speaker: 'customer', text: 'Pressed [1] - Confirmed Order', textBn: '[১] চেপে অর্ডার কনফার্ম করলেন', time: '00:22' }
      ]
    },
    courier: {
      provider: 'Steadfast',
      trackingCode: 'STDF-89210',
      status: 'in_transit',
      currentLocation: 'Steadfast Central Hub, Tejgaon, Dhaka',
      estimatedDelivery: 'Tomorrow Afternoon',
      riderName: 'জাহিদুল ইসলাম',
      riderPhone: '01888990011',
      consignmentId: '109842',
      history: [
        { status: 'Order Placed', time: '10:12 AM', location: 'Website', note: 'Customer placed 1-click order' },
        { status: 'AI Call Confirmed', time: '10:15 AM', location: 'System', note: 'Order verified by AI Agent Sumana' },
        { status: 'Steadfast Consignment Booked', time: '11:00 AM', location: 'Tejgaon Hub', note: 'Handed over to Steadfast courier rider' }
      ]
    },
    fraudCheck: {
      checked: true,
      successRate: 98,
      totalOrders: 24,
      deliveredCount: 23,
      cancelledCount: 1,
      riskLevel: 'safe',
      message: 'গ্রাহকের পূর্ববর্তী ডেলিভারি সফলতা ৯৮%! ১০০% নিরাপদ অর্ডার।'
    },
    createdAt: '2026-11-10T04:12:00Z'
  },
  {
    id: 'BD-89211',
    customer: {
      name: 'রাফসান কবির',
      phone: '01899001122',
      address: 'গ্রাম: চরকালিয়া, ডাকঘর: মির্জাপুর',
      district: 'টাঙ্গাইল',
      thana: 'Mirzapur'
    },
    items: [
      {
        productId: 'prod-002',
        productTitle: 'T9 Vintage Professional Hair Trimmer',
        productTitleBn: 'T9 ভিন্টেজ প্রফেশনাল মেটাল হেয়ার ট্রিমার',
        price: 790,
        quantity: 1,
        selectedColor: 'Vintage Golden',
        selectedSize: 'Standard',
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600'
      }
    ],
    pricing: {
      subtotal: 790,
      deliveryFee: 130,
      discount: 0,
      total: 920
    },
    payment: {
      method: 'cod',
      status: 'pending'
    },
    deliveryZone: 'dhaka_outside',
    status: 'pending',
    aiCallStatus: {
      called: false
    },
    courier: {
      provider: 'Steadfast',
      trackingCode: 'STDF-89211',
      status: 'booked',
      currentLocation: 'Awaiting AI Voice Call',
      estimatedDelivery: 'Within 48-72 hours',
      history: [
        { status: 'Order Received', time: 'Just now', location: 'Website', note: 'Awaiting automated phone confirmation' }
      ]
    },
    fraudCheck: {
      checked: true,
      successRate: 85,
      totalOrders: 6,
      deliveredCount: 5,
      cancelledCount: 1,
      riskLevel: 'safe',
      message: 'স্বাভাবিক নিয়মিত ক্রেতা।'
    },
    createdAt: '2026-11-10T05:05:00Z'
  }
];

export const INITIAL_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'cart-ab-01',
    customerName: 'মেহরাব হোসেন',
    customerPhone: '01911445566',
    customerDistrict: 'চট্টগ্রাম',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedColor: 'Titanium Silver'
      }
    ],
    total: 1920,
    createdAt: '2026-11-10T03:30:00Z',
    recovered: false,
    whatsappSent: false
  },
  {
    id: 'cart-ab-02',
    customerName: 'নাসরিন সুলতানা',
    customerPhone: '01722889900',
    customerDistrict: 'ঢাকা (সিটি কর্পোরেশন)',
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 2
      }
    ],
    total: 2370,
    createdAt: '2026-11-10T02:15:00Z',
    recovered: false,
    whatsappSent: true
  }
];

export const INITIAL_USERS: UserStaff[] = [
  {
    id: 'user-01',
    name: 'Md Hossain (Owner)',
    email: 'hossain@gmail.com',
    phone: '01886289663',
    role: 'super_admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-02',
    name: 'Sumana (AI Call Agent)',
    email: 'sumana.ai@buyonebd.com',
    role: 'support_agent',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z'
  },
  {
    id: 'user-03',
    name: 'Kamrul Islam (Order Dispatcher)',
    email: 'kamrul@buyonebd.com',
    phone: '01755112233',
    role: 'order_manager',
    isActive: true,
    createdAt: '2026-03-10T00:00:00Z'
  }
];

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-01',
    productId: 'prod-001',
    customerName: 'সাকিব মাহমুদ, উত্তরা ঢাকা',
    rating: 5,
    comment: 'অসাধারণ ওয়াচ! কলিং স্পিকার খুবই ক্লিয়ার আর ডিসপ্লে একদম স্মুথ। এআই কল এসে কনফার্ম করল, ২ দিনেই ডেলিভারি পেলাম।',
    date: '২ দিন আগে',
    verifiedPurchase: true
  },
  {
    id: 'rev-02',
    productId: 'prod-001',
    customerName: 'ডা. মাহমুদুল হাসান, সিলেট',
    rating: 5,
    comment: 'ব্যাটারি ব্যাকআপ খুব ভালো দিচ্ছে। ক্যাশ অন ডেলিভারিতে কোনো ঝামেলা ছাড়াই হাতে পেয়েছি। ১০০% রেকমেন্ডেড।',
    date: '১ সপ্তাহ আগে',
    verifiedPurchase: true
  },
  {
    id: 'rev-03',
    productId: 'prod-005',
    customerName: 'আরিফুল ইসলাম, মিরপুর',
    rating: 5,
    comment: 'সুন্দরবনের খাঁটি মধুর স্বাদ! ল্যাব টেস্টেও উত্তীর্ণ। কাঁচের বয়াম খুব যত্নে প্যাকিং করা ছিল।',
    date: '৩ দিন আগে',
    verifiedPurchase: true
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BuyOne BD',
  storeNameBn: 'বাইওয়ান বিডি',
  tagline: 'Bangladesh\'s Most Trusted Smart Shopping Platform',
  taglineBn: 'বাংলাদেশের বিশ্বস্ত ১-ক্লিক স্মার্ট ই-কমার্স ও অটোমেটেড এআই সাপোর্ট',
  hotline: '01886-BUYONE (01886-289663)',
  whatsappNumber: '8801886289663',
  supportEmail: 'buyonebd@gmail.com',
  address: 'লেভেল ৪, হাউস ১৮, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  deliveryFees: {
    dhakaInside: 70,
    dhakaSub: 100,
    dhakaOutside: 130
  },
  paymentSettings: {
    bkashMerchant: '01886289663',
    nagadMerchant: '01886289663',
    rocketMerchant: '018862896630',
    enableCOD: true,
    requireAdvanceDeliveryFee: false,
    advanceFeeAmount: 100
  },
  aiCallSettings: {
    autoCallOnOrder: true,
    agentName: 'Sumana (সুমনা)',
    agentGender: 'female',
    voiceName: 'Kore',
    humanTone: 'Warm, natural, polite human Bangladeshi customer care agent with expressive intonation',
    delaySeconds: 3,
    voiceSpeed: 0.95,
    banglaScript: 'আসসালামু আলাইকুম {customer_name} ভাই! বাইওয়ান বিডি থেকে আমি সুমনা বলছিলাম। আশা করি আপনি ভালো আছেন। আপনি আমাদের শপ থেকে {product_name}, মোট {total_amount} টাকার একটি ক্যাশ অন ডেলিভারি অর্ডার করেছিলেন। আপনার ডেলিভারি ঠিকানা হলো {customer_address}। আপনার অর্ডারটি কনফার্ম করতে চাইলে অনুগ্রহ করে নিচে ১ বাটন চাপুন। আর যদি বাতিল করতে চান তবে ২ চাপুন।'
  },
  announcementBar: {
    enabled: true,
    textBn: '⚡ সুপার অফার: সারাদেশে ক্যাশ অন ডেলিভারি | বিকাশ/নগদে ১০০% নিরাপদ পেমেন্ট | ২-৩ দিনে দ্রুত ডেলিভারি | হটলাইন: 01886-BUYONE',
    textEn: '⚡ Super Deal: Cash on Delivery All Over Bangladesh | bKash/Nagad Verified | 24-48h Delivery | Hotline: 01886-BUYONE'
  },
  spinSettings: {
    enabled: true,
    headlineBn: '🎉 লাকি স্পিন হুইল! ঘুরিয়ে জিতুন ৳১০০-৳৫০০ ক্যাশ ডিসকাউন্ট',
    headlineEn: '🎉 Lucky Spin Wheel! Win ৳100 - ৳500 Instant Discount',
    rewards: [
      { id: 'spin-1', labelBn: '৳১৫০ ক্যাশ ছাড়', labelEn: '৳150 OFF', code: 'SPIN150', discountType: 'fixed', value: 150, color: '#f43f5e', isTryAgain: false },
      { id: 'spin-2', labelBn: 'ফ্রি হোম ডেলিভারি', labelEn: 'Free Delivery', code: 'FREESHIP', discountType: 'free_shipping', value: 0, color: '#0ea5e9', isTryAgain: false },
      { id: 'spin-3', labelBn: 'আবার চেষ্টা করুন', labelEn: 'Try Again', code: 'TRYAGAIN', discountType: 'try_again', value: 0, color: '#475569', isTryAgain: true },
      { id: 'spin-4', labelBn: '৳২৫০ ধামাকা ভাউচার', labelEn: '৳250 OFF', code: 'MEGA250', discountType: 'fixed', value: 250, color: '#10b981', isTryAgain: false },
      { id: 'spin-5', labelBn: '১৫% মেগা ডিসকাউন্ট', labelEn: '15% OFF', code: 'SUPER15', discountType: 'percent', value: 15, color: '#8b5cf6', isTryAgain: false },
      { id: 'spin-6', labelBn: '৳১০০ বিশেষ ছাড়', labelEn: '৳100 OFF', code: 'SPIN100', discountType: 'fixed', value: 100, color: '#f59e0b', isTryAgain: false },
      { id: 'spin-7', labelBn: 'আবার চেষ্টা করুন', labelEn: 'Try Again', code: 'TRYAGAIN', discountType: 'try_again', value: 0, color: '#334155', isTryAgain: true },
      { id: 'spin-8', labelBn: '৳৫০০ ক্যাশব্যাক', labelEn: '৳500 OFF', code: 'LUCKY500', discountType: 'fixed', value: 500, color: '#ec4899', isTryAgain: false }
    ]
  },
  whatsappTemplates: {
    orderConfirmationMsg: 'আসসালামু আলাইকুম {customer_name} ভাই/আপু, BuyOne BD থেকে আপনার অর্ডার #{order_id} সফলভাবে কনফার্ম করা হয়েছে।\nমোট বিল: ৳{total_amount} (ক্যাশ অন ডেলিভারি)\nডেলিভারি ঠিকানা: {address}, {district}\nকুরিয়ার ট্র্যাকিং কোড: {tracking_code}\nযে কোনো তথ্যে যোগাযোগ করুন: 01886-BUYONE। ধন্যবাদ!',
    riderDispatchMsg: 'প্রিয় {customer_name}, আপনার পার্সেলটি (#{order_id}) স্টিডফাস্ট কুরিয়ারে বুকিং দেওয়া হয়েছে। ট্র্যাকিং কোড: {tracking_code}। ২-৩ দিনে আপনার ঠিকানায় পৌঁছাবে। ধন্যবাদ, BuyOne BD।',
    abandonedCartMsg: 'আসসালামু আলাইকুম {customer_name} ভাই! আপনি BuyOne BD তে কার্টে কিছু আকর্ষণীয় পণ্য রেখে গেছেন। অর্ডারটি এখনই সম্পন্ন করলে বিশেষ কুপন [COMEBACK10] দিয়ে পাবেন অতিরিক্ত ১০% ছাড় ও ফ্রি গিফট! লিংক: {recovery_link}'
  },
  categories: INITIAL_CATEGORIES,
  sliders: INITIAL_SLIDERS,
  flashSale: {
    enabled: true,
    headlineBn: '⚡ আজকের বিশেষ ফ্ল্যাশ সেল - ৫০% পর্যন্ত অবিশ্বাস্য মূল্যছাড়!',
    headlineEn: '⚡ Today\'s Mega Flash Sale - Up to 50% Off!',
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    discountPercentage: 50
  },
  courierSettings: {
    steadfast: {
      enabled: true,
      apiKey: 'stdf_live_api_key_buyonebd_883921',
      secretKey: 'stdf_sec_99382173921829102',
      baseUrl: 'https://portal.steadfast.com.bd/api/v1',
      autoBook: true
    },
    pathao: {
      enabled: false,
      clientId: '',
      clientSecret: ''
    },
    redx: {
      enabled: false,
      token: ''
    }
  },
  marketingSettings: {
    facebookPixel: {
      enabled: true,
      pixelId: '984029182910291',
      accessToken: 'EAABwzL...',
      testEventCode: 'TEST1234'
    },
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-BUYONEBD99'
    },
    whatsappCRM: {
      enabled: true,
      autoFollowupAbandoned: true,
      followupDelayMinutes: 30
    }
  },
  aiSettings: {
    geminiApiKey: '',
    openaiApiKey: '',
    claudeApiKey: '',
    selectedProvider: 'gemini',
    selectedModel: 'gemini-3.8-flash',
    autonomousAgentEnabled: true,
    autoRestockAlert: true,
    autoFraudDetection: true
  },
  footerSettings: {
    aboutTextBn: 'BuyOne BD হলো বাংলাদেশের বিশ্বস্ত ১-ক্লিক স্মার্ট ই-কমার্স প্ল্যাটফর্ম। সারাদেশে ক্যাশ অন ডেলিভারি, এআই অটোমেটেড ভয়েস কল কনফার্মেশন ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে দ্রুততম সময়ে আসল পণ্য পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।',
    aboutTextEn: 'BuyOne BD is Bangladesh\'s premier 1-click smart shopping destination with instant AI confirmation calls and nationwide Cash on Delivery.',
    hotline: '01886-BUYONE (01886-289663)',
    whatsappNumber: '8801886289663',
    email: 'buyonebd@gmail.com',
    address: 'লেভেল ৪, হাউস ১৮, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    instagramUrl: 'https://instagram.com',
    copyrightBn: '© ২০২৬ BuyOne BD। সর্বস্বত্ব সংরক্ষিত।',
    copyrightEn: '© 2026 BuyOne BD. All rights reserved.',
    showPaymentBadges: true
  }
};
