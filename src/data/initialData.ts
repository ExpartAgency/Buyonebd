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
  {
    id: 'smart-gadgets',
    nameBn: 'স্মার্ট গ্যাজেট',
    nameEn: 'Smart Gadgets',
    slug: 'smart-gadgets',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 1,
    subcategories: [
      { nameBn: 'স্মার্ট ওয়াচ', nameEn: 'Smart Watches', slug: 'smart-watches', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200' },
      { nameBn: 'ব্লুটুথ ইয়ারবাডস', nameEn: 'TWS Earbuds', slug: 'tws-earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200' },
      { nameBn: 'পাওয়ার ব্যাংক', nameEn: 'Power Banks', slug: 'power-banks', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200' },
      { nameBn: 'ট্রিমার ও শেভার', nameEn: 'Trimmers & Shavers', slug: 'trimmers-shavers', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=200' }
    ]
  },
  {
    id: 'fashion',
    nameBn: 'ফ্যাশন ও লাইফস্টাইল',
    nameEn: 'Fashion & Lifestyle',
    slug: 'fashion',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 2,
    subcategories: [
      { nameBn: 'প্রিমিয়াম টি-শার্ট', nameEn: 'Polo & T-Shirts', slug: 'polo-tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
      { nameBn: 'পাঞ্জাবি ও কাবলি', nameEn: 'Panjabi & Kabli', slug: 'panjabi-kabli', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200' },
      { nameBn: 'লেদার ওয়ালেট', nameEn: 'Leather Wallets', slug: 'leather-wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200' },
      { nameBn: 'সানগ্লাস', nameEn: 'Sunglasses', slug: 'sunglasses', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200' }
    ]
  },
  {
    id: 'organic-food',
    nameBn: 'অর্গানিক ফুড ও মধু',
    nameEn: 'Organic Foods & Honey',
    slug: 'organic-food',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 3,
    subcategories: [
      { nameBn: 'সুন্দরবনের খাঁটি মধু', nameEn: 'Wild Raw Honey', slug: 'wild-raw-honey', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200' },
      { nameBn: 'ঘানির সরিষার তেল', nameEn: 'Cold Pressed Mustard Oil', slug: 'mustard-oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
      { nameBn: 'খাঁটি গাওয়া ঘি', nameEn: 'Pure Desi Ghee', slug: 'pure-ghee', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200' },
      { nameBn: 'ড্রাই ফ্রুটস ও বাদাম', nameEn: 'Dry Fruits & Nuts', slug: 'dry-fruits', image: 'https://images.unsplash.com/photo-1536591375315-1988d696054a?w=200' }
    ]
  },
  {
    id: 'islamic-lifestyle',
    nameBn: 'ইসলামিক ও আতর',
    nameEn: 'Islamic & Attar',
    slug: 'islamic-lifestyle',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 4,
    subcategories: [
      { nameBn: 'জান্নাতুল ফেরদৌস আতর', nameEn: 'Premium Roll-on Attar', slug: 'roll-on-attar', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200' },
      { nameBn: 'ডিজিটাল তসবিহ', nameEn: 'Digital Tasbih Counter', slug: 'digital-tasbih', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200' },
      { nameBn: 'জায়নামাজ', nameEn: 'Luxury Prayer Mat', slug: 'prayer-mats', image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200' },
      { nameBn: 'কুরআন স্ট্যান্ড', nameEn: 'Rehal & Stands', slug: 'rehal-stands', image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=200' }
    ]
  },
  {
    id: 'home-kitchen',
    nameBn: 'হোম ও কিচেন',
    nameEn: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 5,
    subcategories: [
      { nameBn: 'পোর্টেবল ব্লেন্ডার', nameEn: 'Juicer & Blenders', slug: 'juicer-blenders', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=200' },
      { nameBn: 'কিচেন কাটার ও চপার', nameEn: 'Kitchen Cutters & Accessories', slug: 'kitchen-cutters', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200' },
      { nameBn: 'স্মার্ট ক্লক ও লাইট', nameEn: 'Night Lamps & Clocks', slug: 'lamps-clocks', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200' }
    ]
  },
  {
    id: 'beauty-care',
    nameBn: 'বিউটি ও পার্সোনাল কেয়ার',
    nameEn: 'Beauty & Personal Care',
    slug: 'beauty-care',
    icon: '',
    iconImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=240&auto=format&fit=crop&q=80',
    isActive: true,
    order: 6,
    subcategories: [
      { nameBn: 'হেয়ার ট্রিমার ও গ্রুমিং', nameEn: 'Hair Grooming Kits', slug: 'hair-grooming', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=200' },
      { nameBn: 'অর্গানিক স্কিনকেয়ার', nameEn: 'Herbal Skincare', slug: 'herbal-skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
      { nameBn: 'বডি ম্যাসেজার', nameEn: 'Body Massagers', slug: 'body-massagers', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=200' }
    ]
  }
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
    subcategory: 'smart-watches',
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
    warrantyInfoBn: '১ বছরের ব্র্যান্ড সার্ভিস ও ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
    seo: {
      slug: 'ultra-watch-9-pro-amoled-smartwatch',
      metaTitle: 'Ultra Watch 9 Pro AMOLED Smartwatch Price in Bangladesh | BuyOne BD',
      metaDescription: 'Buy Ultra Watch 9 Pro AMOLED Calling Smartwatch at ৳1,850 with Cash on Delivery across Bangladesh.',
      keywords: 'ultra watch 9 pro, smartwatch price bangladesh, amoled calling watch',
      robots: 'index, follow'
    }
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
    subcategory: 'trimmers-shavers',
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
    featuresBn: ['জিরো ট্রিম শার্প টি-ব্লেড', 'সম্পূর্ণ মেটাল ড্রাগন বডি', '১২০০ এমএএইচ রিচার্জেবল ব্যাটারি', '৪টি কাটিং কম্ব (১.৫মিমি, ২মিমি, ৩মিমি, ৪মিমি)'],
    seo: {
      slug: 't9-vintage-professional-hair-trimmer',
      metaTitle: 'T9 Vintage Metal Hair & Beard Trimmer | BuyOne BD',
      metaDescription: 'Original T9 Vintage Metal Rechargeable Hair & Beard Trimmer with zero-gap blade at best price in BD.',
      keywords: 't9 trimmer, vintage hair trimmer bangladesh, beard clipper',
      robots: 'index, follow'
    }
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
    subcategory: 'panjabi-kabli',
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
    featuresBn: ['১০০% নরম ফাইন সুতি কাপড়', 'নিখুঁত সুতার এমব্রয়ডারি কাজ', 'ম্যাচিং স্ন্যাপ বাটন', 'রং ওঠার ভয় নেই'],
    seo: {
      slug: 'royal-handcrafted-cotton-panjabi-set',
      metaTitle: 'Royal Cotton Embroidered Panjabi Set | BuyOne BD',
      metaDescription: 'Fine cotton embroidered Panjabi set with fast home delivery all over Bangladesh.',
      keywords: 'cotton panjabi, eid panjabi bangladesh, mens fashion dhaka',
      robots: 'index, follow'
    }
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
    subcategory: 'tws-earbuds',
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
    featuresBn: ['হাই-ফাই ৯ডি স্টেরিও বেইস', 'ডিজিটাল চার্জিং পার্সেন্টেজ', 'ফিঙ্গারপ্রিন্ট টাচ কন্ট্রোল', 'জরুরি প্রয়োজনে মোবাইল চার্জ সুবিধা'],
    seo: {
      slug: 'm10-tws-wireless-earbuds-powerbank',
      metaTitle: 'M10 TWS Bluetooth 5.1 Earbuds | BuyOne BD',
      metaDescription: 'Shop M10 TWS Wireless Earbuds with 2000mAh emergency powerbank case at ৳690 in Bangladesh.',
      keywords: 'm10 earbuds, tws bluetooth bd, wireless earbuds price',
      robots: 'index, follow'
    }
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
    subcategory: 'wild-raw-honey',
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
    featuresBn: ['সরাসরি সুন্দরবন থেকে সংগৃহীত', 'চিনি বা গ্লুকোজ মুক্ত শতভাগ খাঁটি', 'প্রাকৃতিক এনজাইম ও অ্যান্টিঅক্সিডেন্ট', 'সুরক্ষিত প্রিমিয়াম কাঁচের জার'],
    seo: {
      slug: 'sundarban-khalisha-pure-honey-1kg',
      metaTitle: 'Sundarban Pure Khalisha Honey 1Kg | BuyOne BD',
      metaDescription: '100% pure lab-tested Sundarban Khalisha flower honey delivered fresh in glass jar.',
      keywords: 'sundarban honey, pure honey bangladesh, khalisha honey',
      robots: 'index, follow'
    }
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
    subcategory: 'kitchen-cutters',
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
    featuresBn: ['১৪ রকমের স্টেইনলেস স্টিল ব্লেড', 'ড্রেনেজ বাস্কেট সহ ১.৫ লিটার কন্টেইনার', 'বিপিএ-ফ্রি ফুড গ্রেড প্লাস্টিক', 'হাত কাটার ভয়হীন হ্যান্ডগার্ড'],
    seo: {
      slug: '14-in-1-vegetable-cutter-chopper',
      metaTitle: '14-in-1 Smart Vegetable Cutter & Chopper | BuyOne BD',
      metaDescription: 'Cut cooking prep time in half with the 14-in-1 stainless blade kitchen food chopper.',
      keywords: 'vegetable cutter, kitchen chopper bd, 14 in 1 cutter',
      robots: 'index, follow'
    }
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
    subcategory: 'roll-on-attar',
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
    featuresBn: ['শতভাগ অ্যালকোহল ও কেমিক্যাল মুক্ত', '৪৮+ ঘণ্টা দীর্ঘস্থায়ী সুবাস', 'প্রিমিয়াম ক্রিস্টাল কাঁচের শিশি', 'প্রাকৃতিক ফুলের নির্যাস থেকে প্রস্তুত'],
    seo: {
      slug: 'madina-jannatul-ferdous-pure-attar-12ml',
      metaTitle: 'Jannatul Ferdous Pure Roll-On Attar 12ml | BuyOne BD',
      metaDescription: 'Alcohol-free authentic Jannatul Ferdous concentrated attar oil with 48+ hours fragrance.',
      keywords: 'jannatul ferdous attar, halal perfume bangladesh, attar 12ml',
      robots: 'index, follow'
    }
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
    subcategory: 'herbal-skincare',
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
    featuresBn: ['চালের খাঁটি নির্যাস ও ভিটামিন সমৃদ্ধ', 'সব ধরনের ত্বকের জন্য উপযোগী', 'প্যারাবেন ও ক্ষতিকর কেমিক্যাল মুক্ত', 'নরম ও উজ্জ্বল ত্বকের নিশ্চয়তা'],
    seo: {
      slug: 'rice-water-brightening-foaming-cleanser',
      metaTitle: 'Rice Water Brightening Foaming Cleanser 150ml | BuyOne BD',
      metaDescription: 'Korean formula Rice Water & Moringa deep pore brightening cleanser in Bangladesh.',
      keywords: 'rice water cleanser, skincare bangladesh, brightening facewash',
      robots: 'index, follow'
    }
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
  logoUrl: '',
  logoMode: 'text',
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
    textBn: '🚚 সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা | হেল্পলাইন: 01886-289663',
    textEn: '🚚 Nationwide Fast Home Delivery with Cash on Delivery | Helpline: 01886-289663'
  },
  theme: 'gadgets',
  themeColors: {
    primary: '#059669',
    secondary: '#0d9488',
    headerBg: '#ffffff',
    footerBg: '#020617',
    heroFrom: '#020617',
    heroTo: '#064e3b'
  },
  cmsTexts: {
    trendingTitleBn: 'হট ও ট্রেন্ডিং কালেকশন',
    trendingTitleEn: 'Hot & Trending Collection',
    orderNowBtnBn: 'অর্ডার করুন',
    orderNowBtnEn: 'Order Now',
    addToCartBtnBn: 'কার্টে যোগ করুন',
    addToCartBtnEn: 'Add to Cart',
    allCategoriesLabelBn: 'সকল পণ্য',
    allCategoriesLabelEn: 'All Products'
  },
  spinSettings: {
    enabled: true,
    headlineBn: '🎉 লাকি স্পিন হুইল! ঘুরিয়ে জিতুন আকর্ষণীয় উপহার',
    headlineEn: '🎉 Lucky Spin Wheel! Spin & Win Instant Rewards',
    spinsPerDay: 4,
    rewards: [
      { id: 'spin-1', labelBn: '৳৫০০ ক্যাশ', labelEn: '৳500 OFF', code: 'TEMU500', discountType: 'fixed', value: 500, color: '#f43f5e', isTryAgain: false },
      { id: 'spin-2', labelBn: 'ফ্রি ডেলিভারি', labelEn: 'Free Ship', code: 'FREESHIP', discountType: 'free_shipping', value: 70, color: '#0284c7', isTryAgain: false },
      { id: 'spin-3', labelBn: '৳২৫০ ছাড়', labelEn: '৳250 OFF', code: 'MEGA250', discountType: 'fixed', value: 250, color: '#10b981', isTryAgain: false },
      { id: 'spin-4', labelBn: '৫০% মেগা', labelEn: '50% OFF', code: 'HALFPRICE', discountType: 'percent', value: 50, color: '#8b5cf6', isTryAgain: false },
      { id: 'spin-5', labelBn: '৳১৫০ ক্যাশ', labelEn: '৳150 OFF', code: 'CASH150', discountType: 'fixed', value: 150, color: '#f59e0b', isTryAgain: false },
      { id: 'spin-6', labelBn: '৳১০০ ওয়ালেট', labelEn: '৳100 OFF', code: 'GIFT100', discountType: 'fixed', value: 100, color: '#059669', isTryAgain: false },
      { id: 'spin-7', labelBn: '২০% ভাউচার', labelEn: '20% OFF', code: 'DEAL20', discountType: 'percent', value: 20, color: '#d97706', isTryAgain: false },
      { id: 'spin-8', labelBn: '৳৩০০ বোনাস', labelEn: '৳300 OFF', code: 'BONUS300', discountType: 'fixed', value: 300, color: '#ec4899', isTryAgain: false }
    ]
  },
  whatsappTemplates: {
    orderConfirmationMsg: 'আসসালামু আলাইকুম {customer_name} ভাই/আপু, BuyOne BD থেকে আপনার অর্ডার #{order_id} সফলভাবে কনফার্ম করা হয়েছে।\nমোট বিল: ৳{total_amount} (ক্যাশ অন ডেলিভারি)\nডেলিভারি ঠিকানা: {address}, {district}\nকুরিয়ার ট্র্যাকিং কোড: {tracking_code}\nযে কোনো তথ্যে যোগাযোগ করুন: 01886-BUYONE। ধন্যবাদ!',
    riderDispatchMsg: 'প্রিয় {customer_name}, আপনার পার্সেলটি (#{order_id}) স্টিডফাস্ট কুরিয়ারে বুকিং দেওয়া হয়েছে। ট্র্যাকিং কোড: {tracking_code}। ২-৩ দিনে আপনার ঠিকানায় পৌঁছাবে। ধন্যবাদ, BuyOne BD।',
    abandonedCartMsg: 'আসসালামু আলাইকুম {customer_name} ভাই! আপনি BuyOne BD তে কার্টে কিছু আকর্ষণীয় পণ্য রেখে গেছেন। অর্ডারটি এখনই সম্পন্ন করলে বিশেষ কুপন [COMEBACK10] দিয়ে পাবেন অতিরিক্ত ১০% ছাড় ও ফ্রি গিফট! লিংক: {recovery_link}'
  },
  marketingTemplates: {
    orderConfirmation: 'আসসালামু আলাইকুম {customer_name}! BuyOne BD-তে আপনার অর্ডার #{order_id} সফলভাবে গ্রহণ করা হয়েছে। মোট বিল: ৳{total_amount} (COD)। ঠিকানা: {customer_address}। দ্রুততম সময়ে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ!',
    shippingDispatched: 'প্রিয় {customer_name}! আপনার অর্ডার #{order_id} কুরিয়ারে ({courier_name}) বুকিং সম্পন্ন হয়েছে। লাইভ ট্র্যাকিং কোড: {tracking_code}। পার্সেল আসার পর চেক করে মূল্য পরিশোধ করুন। ধন্যবাদ, BuyOne BD।',
    orderHold: 'আসসালামু আলাইকুম {customer_name}! আপনার অর্ডার #{order_id}-এর জন্য ফোন নম্বর ও সঠিক ডেলিভারি ঠিকানা যাচাই প্রয়োজন। অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা নিশ্চিত করুন। BuyOne BD হেল্পলাইন: 01886-289663।',
    orderCancellation: 'প্রিয় {customer_name}, আপনার অনুরোধ অনুযায়ী অর্ডার #{order_id} বাতিল করা হয়েছে। ভবিষ্যতে BuyOne BD-তে আপনাকে আবার স্বাগত জানাই!',
    cartRecovery: 'আসসালামু আলাইকুম {customer_name}! আপনি BuyOne BD-তে কার্টে পণ্য রেখে গেছেন। আজই অর্ডার নিশ্চিত করলে পাচ্ছেন বিশেষ ৳১০০ ডিসকাউন্ট! কুপন কোড: WIN100।',
    promotionalBroadcast: '🔥 ধামাকা অফার BuyOne BD-তে! সীমিত সময়ের জন্য ৫০% পর্যন্ত মূল্যছাড় চলছে। এখনই ভিজিট করুন এবং ক্যাশ অন ডেলিভারিতে পছন্দের পণ্য কিনুন!',
    autoTriggerOnOrder: true,
    autoTriggerOnShipped: true
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
      enabled: true,
      clientId: '',
      clientSecret: ''
    },
    redx: {
      enabled: true,
      token: ''
    },
    paperfly: {
      enabled: true,
      username: '',
      apiKey: ''
    },
    sundarban: {
      enabled: true,
      branchCode: 'DHK-01',
      apiKey: ''
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
    },
    tiktokPixel: {
      enabled: true,
      pixelId: 'C789TTIKTOK990'
    },
    whatsappCloudApi: {
      enabled: false,
      phoneNumberId: '',
      wabaId: '',
      accessToken: '',
      verifyToken: 'buyonebd_meta_verify_2026',
      apiVersion: 'v21.0',
      defaultTemplate: 'order_confirmation_bn'
    },
    socialLinks: {
      facebookPageId: 'BuyOneBD',
      facebookUrl: 'https://facebook.com/buyonebd',
      instagramHandle: '@buyonebd',
      tiktokHandle: '@buyonebd.official',
      youtubeUrl: 'https://youtube.com/@buyonebd'
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
  aiKeywordRules: [
    {
      id: 'kw-delivery',
      keywords: ['ডেলিভারি', 'চার্জ', 'কুরিয়ার', 'কতদিন', 'delivery', 'shipping', 'charge', 'courier'],
      replyBn: 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি চলছে! ঢাকা সিটি: ৳৭০ (২৪-৪৮ ঘণ্টা), ঢাকা উপশহর: ৳১০০, ঢাকার বাইরে: ৳১৩০ (৪৮-৭২ ঘণ্টা)। Steadfast ও Pathao-তে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।',
      replyEn: 'Nationwide delivery across all 64 districts: Inside Dhaka ৳70 (24-48h), Sub-Dhaka ৳100, Outside Dhaka ৳130 (48-72h) via Steadfast & Pathao with Cash on Delivery.',
      enabled: true
    },
    {
      id: 'kw-payment',
      keywords: ['বিকাশ', 'নগদ', 'রকেট', 'পেমেন্ট', 'ক্যাশ', 'bkash', 'nagad', 'rocket', 'payment', 'cod'],
      replyBn: 'আপনি পণ্য হাতে পেয়ে সম্পূর্ণ টাকা পরিশোধ (Cash on Delivery) করতে পারবেন! এছাড়া বিকাশ/নগদ/রকেট নম্বর: 01886289663।',
      replyEn: 'Cash on Delivery (pay after checking parcel) is available everywhere. Mobile payments: bKash / Nagad / Rocket Merchant: 01886289663.',
      enabled: true
    },
    {
      id: 'kw-return',
      keywords: ['রিটার্ন', 'রিফান্ড', 'ওয়ারেন্টি', 'চেঞ্জ', 'ফেরত', 'return', 'refund', 'warranty', 'exchange'],
      replyBn: 'প্রতিটি পণ্যে ৭ দিনের সহজ রিপ্লেসমেন্ট ও রিটার্ন গ্যারান্টি রয়েছে! পণ্য দেখে পছন্দ না হলে ডেলিভারি ম্যানের সামনেই রিটার্ন করতে পারবেন।',
      replyEn: 'Every product comes with our 7-day easy replacement & return guarantee. You can inspect the parcel upon delivery.',
      enabled: true
    },
    {
      id: 'kw-discount',
      keywords: ['ডিসকাউন্ট', 'ছাড়', 'কুপন', 'স্পিন', 'ফ্রি', 'discount', 'coupon', 'offer', 'spin', 'voucher'],
      replyBn: 'আমাদের লাকি স্পিন হুইল ঘুরিয়ে প্রতিদিন ৳৫০০ পর্যন্ত গিফট ওয়ালেট ক্যাশ এবং ফ্রি ডেলিভারি কুপন জিতে নিতে পারেন! ফ্ল্যাশ সেলে ৫০% পর্যন্ত ছাড় চলছে।',
      replyEn: 'Spin our Lucky Spin Wheel to win up to ৳500 Gift Wallet cash or free delivery coupons! Also check Flash Sale for up to 50% off.',
      enabled: true
    },
    {
      id: 'kw-authentic',
      keywords: ['অরিজিনাল', 'আসল', 'মান', 'কোয়ালিটি', 'original', 'authentic', 'fake', 'quality'],
      replyBn: 'BuyOne BD শতভাগ অরিজিনাল ও যাচাইকৃত পণ্য সরবরাহ করে। মধু ও অর্গানিক ফুড ল্যাব টেস্টে উত্তীর্ণ এবং গ্যাজেটে অফিশিয়াল ওয়ারেন্টি থাকে।',
      replyEn: 'All BuyOne BD products are 100% authentic and quality checked before dispatch with official brand warranty.',
      enabled: true
    },
    {
      id: 'kw-contact',
      keywords: ['ঠিকানা', 'অফিস', 'শোরুম', 'হেল্পলাইন', 'ফোন', 'নম্বর', 'address', 'office', 'contact', 'phone', 'hotline'],
      replyBn: 'আমাদের অফিস: লেভেল ৪, হাউস ১৮, রোড ১১, বনানী, ঢাকা-১২১৩। হটলাইন ও হোয়াটসঅ্যাপ: 01886-289663 (সকাল ৯টা – রাত ১১টা)।',
      replyEn: 'Our office: Level 4, House 18, Road 11, Banani, Dhaka-1213. Hotline & WhatsApp: 01886-289663.',
      enabled: true
    },
    {
      id: 'kw-wholesale',
      keywords: ['পাইকারি', 'হোলসেল', 'বেশি নিলে', 'wholesale', 'bulk', 'reseller'],
      replyBn: 'জ্বী! পাইকারি বা কর্পোরেট বাল্ক অর্ডারে বিশেষ ছাড় পাওয়া যায়। সরাসরি আমাদের হোয়াটসঅ্যাপে (01886289663) পণ্যের নাম ও পরিমাণ জানান।',
      replyEn: 'Yes! We offer special wholesale and bulk pricing. Contact our WhatsApp desk (01886289663) with your required quantity.',
      enabled: true
    }
  ],
  seoSettings: {
    metaTitle: 'BuyOne BD - বাংলাদেশের বিশ্বস্ত অনলাইন শপিং | Smart E-Commerce',
    metaDescription: 'স্মার্ট গ্যাজেট, প্রিমিয়াম আতর, অর্গানিক ফুড ও লাইফস্টাইল পণ্য সারাদেশে ক্যাশ অন ডেলিভারিতে কিনুন BuyOne BD-তে। এআই কল কনফার্মেশন ও দ্রুত কুরিয়ার ডেলিভারি।',
    keywords: 'BuyOne BD, online shopping bangladesh, smart gadgets dhaka, organic honey bangladesh, roll-on attar, cash on delivery bangladesh, steadfast courier tracking',
    ogImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
    canonicalUrl: 'https://buyonebd.com',
    robots: 'index, follow',
    twitterHandle: '@buyonebd',
    googleSiteVerification: '',
    schemaType: 'Store',
    sitemapEnabled: true,
    robotsTxt: `User-agent: *\nAllow: /\nAllow: /products\nAllow: /product/\nAllow: /category/\nAllow: /tracking\nDisallow: /hossain\nDisallow: /api/\n\nSitemap: https://buyonebd.com/sitemap.xml`
  },
  footerSettings: {
    aboutTextBn: 'BuyOne BD হলো বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। সারাদেশে ক্যাশ অন ডেলিভারি, এআই অটোমেটেড ভয়েস কল কনফার্মেশন ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে দ্রুততম সময়ে আসল পণ্য পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।',
    aboutTextEn: 'BuyOne BD is Bangladesh\'s premier shopping destination with instant AI confirmation calls and nationwide Cash on Delivery.',
    hotline: '01886-BUYONE (01886-289663)',
    whatsappNumber: '8801886289663',
    email: 'buyonebd@gmail.com',
    address: 'লেভেল ৪, হাউস ১৮, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    copyrightBn: '© ২০২৬ BuyOne BD। সর্বস্বত্ব সংরক্ষিত।',
    copyrightEn: '© 2026 BuyOne BD. All rights reserved.',
    showPaymentBadges: true,
    showCategoriesInFooter: true,
    quickLinks: [
      { id: 'ql-1', labelBn: 'রিয়েল-টাইম অর্ডার ট্র্যাকিং', labelEn: 'Live Order Tracking', actionType: 'tracking' },
      { id: 'ql-2', labelBn: 'আজকের ফ্ল্যাশ সেল অফার', labelEn: "Today's Flash Sale Deals", actionType: 'flash_sale' },
      { id: 'ql-3', labelBn: '৭ দিনের রিটার্ন ও রিফান্ড নীতি', labelEn: '7 Days Return & Refund Policy', actionType: 'store' },
      { id: 'ql-4', labelBn: 'গোপনীয়তা ও শর্তাবলী', labelEn: 'Terms & Privacy Policy', actionType: 'store' }
    ]
  }
};

export interface BusinessThemePreset {
  id: StoreSettings['theme'];
  nameBn: string;
  nameEn: string;
  emoji: string;
  descBn: string;
  descEn: string;
  colors: NonNullable<StoreSettings['themeColors']>;
  suggestedCategories: Omit<Category, 'id'>[];
}

export const BUSINESS_THEME_PRESETS: BusinessThemePreset[] = [
  {
    id: 'gadgets',
    nameBn: 'স্মার্ট গ্যাজেট ও টেক',
    nameEn: 'Smart Gadgets & Tech',
    emoji: '⌚',
    descBn: 'স্মার্টওয়াচ, ইয়ারবাড, পাওয়ারব্যাংক',
    descEn: 'Smartwatches, Audio, Accessories',
    colors: { primary: '#059669', secondary: '#0d9488', headerBg: '#ffffff', footerBg: '#020617', heroFrom: '#020617', heroTo: '#064e3b' },
    suggestedCategories: [
      { nameBn: 'স্মার্ট ওয়াচ', nameEn: 'Smart Watches', slug: 'smart-watches', isActive: true, iconImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
      { nameBn: 'ইয়ারবাডস ও অডিও', nameEn: 'Earbuds & Audio', slug: 'audio', isActive: true, iconImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200' },
      { nameBn: 'চার্জার ও পাওয়ারব্যাংক', nameEn: 'Chargers & Power', slug: 'chargers', isActive: true, iconImage: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200' }
    ]
  },
  {
    id: 'islamic',
    nameBn: 'সুন্নাহ, আতর ও ইসলামিক',
    nameEn: 'Sunnah, Attar & Islamic',
    emoji: '🕌',
    descBn: 'অরিজিনাল আতর, তসবিহ, জায়নামাজ',
    descEn: 'Pure Attar, Prayer Mats, Tasbih',
    colors: { primary: '#047857', secondary: '#b45309', headerBg: '#ffffff', footerBg: '#022c22', heroFrom: '#022c22', heroTo: '#1e293b' },
    suggestedCategories: [
      { nameBn: 'প্রিমিয়াম আতর', nameEn: 'Pure Roll-on Attar', slug: 'islamic-lifestyle', isActive: true, iconImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200' },
      { nameBn: 'জায়নামাজ ও টুপি', nameEn: 'Prayer Mats & Caps', slug: 'prayer-mats', isActive: true, iconImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200' },
      { nameBn: 'ডিজিটাল তসবিহ ও বই', nameEn: 'Tasbih & Islamic Books', slug: 'tasbih', isActive: true, iconImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200' }
    ]
  },
  {
    id: 'organic',
    nameBn: 'অর্গানিক ফুড ও মধু',
    nameEn: 'Organic Food & Honey',
    emoji: '🍯',
    descBn: 'সুন্দরবনের মধু, গাওয়া ঘি, সরিষার তেল',
    descEn: 'Raw Honey, Pure Ghee, Cold Oils',
    colors: { primary: '#d97706', secondary: '#15803d', headerBg: '#ffffff', footerBg: '#1c1917', heroFrom: '#1c1917', heroTo: '#713f12' },
    suggestedCategories: [
      { nameBn: 'খাঁটি মধু', nameEn: 'Pure Raw Honey', slug: 'organic-food', isActive: true, iconImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200' },
      { nameBn: 'খাঁটি ঘি ও তেল', nameEn: 'Pure Ghee & Mustard Oil', slug: 'ghee-oil', isActive: true, iconImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
      { nameBn: 'খেজুর ও ড্রাই ফ্রুটস', nameEn: 'Dates & Dry Fruits', slug: 'dry-fruits', isActive: true, iconImage: 'https://images.unsplash.com/photo-1536591375315-1988d696054a?w=200' }
    ]
  },
  {
    id: 'medical',
    nameBn: 'মেডিকেল ও হেলথ কেয়ার',
    nameEn: 'Medical & Healthcare',
    emoji: '💊',
    descBn: 'ডিজিটাল থার্মোমিটার, ব্লাড প্রেশার মনিটর',
    descEn: 'Health Monitors, First Aid, Wellness',
    colors: { primary: '#0284c7', secondary: '#059669', headerBg: '#ffffff', footerBg: '#0c4a6e', heroFrom: '#0c4a6e', heroTo: '#0f172a' },
    suggestedCategories: [
      { nameBn: 'হেলথ ডিভাইস', nameEn: 'Health Devices', slug: 'health-devices', isActive: true, iconImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
      { nameBn: 'ভিটামিন ও সাপ্লিমেন্ট', nameEn: 'Vitamins & Supplements', slug: 'supplements', isActive: true, iconImage: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200' }
    ]
  },
  {
    id: 'fashion',
    nameBn: 'ফ্যাশন ও লাইফস্টাইল',
    nameEn: 'Fashion & Lifestyle',
    emoji: '👔',
    descBn: 'পাঞ্জাবি, টি-শার্ট, শাড়ি, ওয়ালেট',
    descEn: 'Panjabi, Apparel, Leather Goods',
    colors: { primary: '#e11d48', secondary: '#9333ea', headerBg: '#ffffff', footerBg: '#0f172a', heroFrom: '#1e1b4b', heroTo: '#881337' },
    suggestedCategories: [
      { nameBn: 'মেন্স কালেকশন', nameEn: "Men's Fashion", slug: 'fashion', isActive: true, iconImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200' },
      { nameBn: 'উইমেন্স ও জুয়েলারি', nameEn: "Women's & Jewelry", slug: 'womens-fashion', isActive: true, iconImage: 'https://images.unsplash.com/photo-1483985988655-71728e1935b8?w=200' }
    ]
  },
  {
    id: 'beauty',
    nameBn: 'বিউটি ও স্কিনকেয়ার',
    nameEn: 'Beauty & Cosmetics',
    emoji: '💄',
    descBn: 'কোরিয়ান স্কিনকেয়ার, সিরাম, ফেসওয়াশ',
    descEn: 'Skincare, Serums, Cosmetics',
    colors: { primary: '#db2777', secondary: '#f43f5e', headerBg: '#ffffff', footerBg: '#4c0519', heroFrom: '#500724', heroTo: '#831843' },
    suggestedCategories: [
      { nameBn: 'ফেসওয়াশ ও ক্লিনজার', nameEn: 'Cleansers & Washes', slug: 'beauty-care', isActive: true, iconImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
      { nameBn: 'সিরাম ও ময়েশ্চারাইজার', nameEn: 'Serums & Creams', slug: 'serums', isActive: true, iconImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200' }
    ]
  },
  {
    id: 'grocery',
    nameBn: 'গ্রোসারি ও সুপারশপ',
    nameEn: 'Grocery & Daily Mart',
    emoji: '🛒',
    descBn: 'চাল, ডাল, মসলা ও নিত্যপ্রয়োজনীয় পণ্য',
    descEn: 'Daily Essentials, Spices, Pantry',
    colors: { primary: '#16a34a', secondary: '#ca8a04', headerBg: '#ffffff', footerBg: '#052e16', heroFrom: '#052e16', heroTo: '#14532d' },
    suggestedCategories: [
      { nameBn: 'নিত্যপণ্য ও গ্রোসারি', nameEn: 'Daily Grocery', slug: 'grocery', isActive: true, iconImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' },
      { nameBn: 'হোম ক্লিনিং', nameEn: 'Home Cleaning', slug: 'cleaning', isActive: true, iconImage: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200' }
    ]
  },
  {
    id: 'electronics',
    nameBn: 'ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স',
    nameEn: 'Electronics & Appliances',
    emoji: '📺',
    descBn: 'ব্লেন্ডার, রাইস কুকার, স্মার্ট টিভি বক্স',
    descEn: 'Kitchen Appliances, Smart Home',
    colors: { primary: '#2563eb', secondary: '#06b6d4', headerBg: '#ffffff', footerBg: '#0f172a', heroFrom: '#0f172a', heroTo: '#1e3a8a' },
    suggestedCategories: [
      { nameBn: 'হোম ও কিচেন', nameEn: 'Home & Kitchen', slug: 'home-kitchen', isActive: true, iconImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200' },
      { nameBn: 'স্মার্ট লাইট ও ফ্যান', nameEn: 'Lights & Cooling', slug: 'lights', isActive: true, iconImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200' }
    ]
  },
  {
    id: 'kids',
    nameBn: 'বেবি ও কিডস শপ',
    nameEn: 'Baby, Kids & Toys',
    emoji: '🧸',
    descBn: 'বেবি কেয়ার, শিক্ষণীয় খেলনা, পোশাক',
    descEn: 'Educational Toys, Baby Care',
    colors: { primary: '#7c3aed', secondary: '#ec4899', headerBg: '#ffffff', footerBg: '#2e1065', heroFrom: '#2e1065', heroTo: '#701a75' },
    suggestedCategories: [
      { nameBn: 'বাচ্চাদের খেলনা', nameEn: 'Kids Toys', slug: 'kids-toys', isActive: true, iconImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200' },
      { nameBn: 'বেবি কেয়ার', nameEn: 'Baby Care', slug: 'baby-care', isActive: true, iconImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200' }
    ]
  },
  {
    id: 'books',
    nameBn: 'বই ও স্টেশনারি হাব',
    nameEn: 'Books & Stationery',
    emoji: '📚',
    descBn: 'বেস্টসেলার বই, ডায়েরি ও অফিস আইটেম',
    descEn: 'Bestsellers, Academic, Office',
    colors: { primary: '#ea580c', secondary: '#0d9488', headerBg: '#ffffff', footerBg: '#1e293b', heroFrom: '#1e293b', heroTo: '#7c2d12' },
    suggestedCategories: [
      { nameBn: 'জনপ্রিয় বই', nameEn: 'Popular Books', slug: 'books', isActive: true, iconImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200' },
      { nameBn: 'অফিস স্টেশনারি', nameEn: 'Office Stationery', slug: 'stationery', isActive: true, iconImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200' }
    ]
  }
];

