interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export default function BrandLogo({ className = 'h-8 w-auto', alt = 'Spark logo' }: BrandLogoProps) {
  return <img src="/spark-logo.svg" alt={alt} className={className} />;
}
