export interface MonthImage {
  src: string;
  alt: string;
  accentColor: string;
  photographer: string;
}

export const MONTH_IMAGES: MonthImage[] = [
  { src: "/1.jpg", alt: "January Wall Calendar", accentColor: "#683b2b", photographer: "Local" },
  { src: "/2.jpg", alt: "February Wall Calendar", accentColor: "#7a3f30", photographer: "Local" },
  { src: "/3.jpg", alt: "March Wall Calendar", accentColor: "#5a3525", photographer: "Local" },
  { src: "/4.jpg", alt: "April Wall Calendar", accentColor: "#683b2b", photographer: "Local" },
  { src: "/5.jpg", alt: "May Wall Calendar", accentColor: "#7c4535", photographer: "Local" },
  { src: "/6.jpg", alt: "June Wall Calendar", accentColor: "#603020", photographer: "Local" },
  { src: "/7.jpg", alt: "July Wall Calendar", accentColor: "#683b2b", photographer: "Local" },
  { src: "/8.jpg", alt: "August Wall Calendar", accentColor: "#7a3f30", photographer: "Local" },
  { src: "/9.jpg", alt: "September Wall Calendar", accentColor: "#683b2b", photographer: "Local" },
  { src: "/10.jpg", alt: "October Wall Calendar", accentColor: "#7a3a28", photographer: "Local" },
  { src: "/11.jpg", alt: "November Wall Calendar", accentColor: "#5a3020", photographer: "Local" },
  { src: "/12.jpg", alt: "December Wall Calendar", accentColor: "#683b2b", photographer: "Local" },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];
