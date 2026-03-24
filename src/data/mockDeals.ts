export type DealStatus = 'inquiry' | 'negotiating' | 'contract_signed' | 'in_production';
export type DealPriority = 'high' | 'medium' | 'low';

export interface Deal {
  id: string;
  brandName: string;
  projectName: string;
  description: string;
  budget: number;
  status: DealStatus;
  priority: DealPriority;
  icon: string;
  contactAvatar: string;
}

export const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    brandName: 'XYZ Ultra',
    projectName: 'Tech Review Video',
    description: 'Unboxing & Deep Dive for XYZ Ultra',
    budget: 4500,
    status: 'inquiry',
    priority: 'high',
    icon: 'auto_awesome',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtwemwCvOO8hINirgbLJFKsQVdiLte3Obwx_UiB-D5ZsB79uYuXEW5RypB6JGnZvoG2hXsnrlrVhAjJrAO8MfWVD1_xKVc-jsL_hBsL0QqkIioZBt5wXYZUDHVI6vkIpXBpTspr9D4JpMArTm-AmwWk3YxctcTjaiOK0cBBwLvTOKC4EZol8Ly_mCEQnoWDIwjWt-68na39BTWgzvl8ZBJl-DRkSNxboSr5G1NO9boJ_btMUmRGUW0fssEjaR839mKuEwpO0joixpG',
  },
  {
    id: '2',
    brandName: 'AudioMax',
    projectName: 'Podcast Sponsorship',
    description: 'Pre-roll + Integrated shoutout',
    budget: 1200,
    status: 'inquiry',
    priority: 'medium',
    icon: 'headphones',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_xFmW2KYfaBu18amNvRE2cXy-aHsZB9QN2IIY4t9Fx5uxw7vM5x8xpxciB0TnMruasEy4XDWX8QOd_xgU99kDco1h7P1_Ccs8A93h1zDxATGWXA2owsWNEcwiiHSer0RzizG-GEIFbFYLgPCd_s2FcWTwuCjKWCRZx44FjHi6F87nYw0Ono78rxLWpVFv83ig1cRgTDaOhDYTAKFm5sjjT8hFxKL07TrQw52p-cdt0oWR3SU4-iy0ALgGXrHEEZWcLHjAsKRIb4TO',
  },
  {
    id: '3',
    brandName: 'StyleCo',
    projectName: 'Product Launch Post',
    description: 'Instagram Carousel & Reel package',
    budget: 2800,
    status: 'negotiating',
    priority: 'low',
    icon: 'rocket_launch',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZUyUCpM0fe2oct7hxRi8KwHaYzeaJLXClCk2J6F2n4doNhnylXx-wzp8AyrN-rxBSam39c4uUixYZT_sJ2WSkX4Iiqcl4lfFmHDM9cTXbPLvMKzX3zOgqnLwUBGi-10YXrLJ_moPUpUSbyWqrV3n5V0q_1lwgBlk78wv31VUq9KVhyh2APfyNfyNqd9DJXNesIyyc4bBXE3tmmTtkfKpWGi7VsTbo1Vmkf52Z3DmBSo3OFFR95lsyZQFaf7dhELmPV6HTjPwq3aXq',
  },
  {
    id: '4',
    brandName: 'VlogMedia',
    projectName: 'Vlog Series Sponsorship',
    description: '3-part video series on creator lifestyle',
    budget: 12000,
    status: 'contract_signed',
    priority: 'high',
    icon: 'videocam',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzxK4ibij55OU1mPfndp_59Y2G441Z-YDzAG9ev-biQMIvehNQ_i3QMzQFGGnntp07s64As14hNBx5Qnigj462KixS-SpZP5o4uhm3cM3RjYfEVybHHfpV9DdRPxWnpUnDcFPTOAEowZQeiNIm9vOrhgnRD5uzt6GgVRVdMlYBt5BY3bFwK0f0bjCj9wGD8uJzDNgjrYrls05kgiYfFPg9EmWgmniG3XoCwjzcA2O9DooCOaF2AP7odubvl32faSfJh8IJZgKlP2S_',
  },
  {
    id: '5',
    brandName: 'The Creative Edge',
    projectName: 'Monthly Newsletter Spot',
    description: "Featured link in 'The Creative Edge'",
    budget: 850,
    status: 'contract_signed',
    priority: 'low',
    icon: 'news',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxtqXtsrovxuxM0Yjo3IlD_EGyIFL7-m0jbR-j7v9OrULNu3JLKtRdpW7qFq9IuP60Tyi3ABWWhSsGXGSd7XrTveBGBRPd_BFRkrsmNlAF6oSMJUoK-I42TH7divEnZFM4W0tU7SElCqVUs-_tEIg59YLIu3nSvxydqpbFyFbP5qD5H2d1naGeFHORdG_8QT5ZlbTG4SM_y0PiL5wxgh78-tKqpul6AFKsy2C9La2_m9MrwWgoNi7uXA76dUjd1Y4FAc89tnTkJHQr',
  },
  {
    id: '6',
    brandName: 'ProCreate Studios',
    projectName: 'Masterclass Series',
    description: 'Editing workflow tutorial series',
    budget: 6200,
    status: 'in_production',
    priority: 'medium',
    icon: 'camera',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ-3nv4SjqDCoRnsjhbUH3-zkL87h0w2njIhdlWNsQ34MX03AV0GhTnuDu-43pqm3DDVo0aDrIuFl8c0U_a5zQ2AffVeQkcWw20YYjAy8EqTLY_rNgilqwyrJ6W_RoVqw-ACLcamoYRkHrKCaWGb4wkz-_-mWtNTosccx-sX6iIahQdF_AZTZVegCch3glTPEKU5d8moAAlExBnlEl2Dr9fZ3iAP_u8NvxGdcZjuDap-q3ZuwSJrOhajIjQsoE4OUkDAq0v40IPnWC',
  },
];
