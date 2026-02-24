"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
    const pathname = usePathname();

    if (!pathname || pathname === "/") {
        return null; 
    }

    const pathSegments = pathname.split("/").filter((segment) => segment !== "");

    return (
        <nav aria-label="Breadcrumb" className="w-full flex px-4 py-3 bg-slate-900/50 border-b border-slate-800">
            <ol className="flex items-center space-x-2 text-sm text-slate-400 max-w-7xl mx-auto w-full">
                <li>
                    <Link href="/" className="flex items-center hover:text-neon-cyan transition-colors">
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathSegments.length - 1;

                    // Format the segment name (capitalize first letter, replace dashes with spaces)
                    let segmentName = segment.replace(/-/g, " ");
                    segmentName = segmentName.charAt(0).toUpperCase() + segmentName.slice(1);

                    return (
                        <li key={href} className="flex items-center">
                            <ChevronRight className="w-4 h-4 mx-1 text-slate-600" />
                            {isLast ? (
                                <span className="text-slate-200 font-medium px-1" aria-current="page">
                                    {segmentName}
                                </span>
                            ) : (
                                <Link
                                    href={href}
                                    className="hover:text-neon-cyan transition-colors px-1"
                                >
                                    {segmentName}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
