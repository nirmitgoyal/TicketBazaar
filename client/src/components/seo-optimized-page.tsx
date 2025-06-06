import React from "react";
import EnhancedSEO from "./enhanced-seo";
import { generateOrganizationStructuredData } from "@/utils/seo-utils";

interface SEOOptimizedPageProps {
  type?: "event" | "search" | "category" | "general";
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  data?: any;
  structuredData?: object[];
  noIndex?: boolean;
  children: React.ReactNode;
}

export default function SEOOptimizedPage({
  type = "general",
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  data,
  structuredData = [],
  noIndex = false,
  children,
}: SEOOptimizedPageProps) {
  // Always include organization structured data
  const organizationData = generateOrganizationStructuredData();
  const allStructuredData = [organizationData, ...structuredData];

  return (
    <>
      <EnhancedSEO
        type={type}
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        ogType={ogType}
        data={data}
        structuredData={allStructuredData}
        noIndex={noIndex}
      />
      {children}
    </>
  );
}