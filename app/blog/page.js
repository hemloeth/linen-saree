"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api/client";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest("/api/blog/allblogs")
      .then((data) => {
        if (!active) return;
        if (data.success && data.blogs) {
          setBlogs(data.blogs);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 lg:px-10 lg:py-14">
        <div className="border-b border-pine-950/10 pb-6 text-center">
          <span className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
            Stories & Craft
          </span>
          <h1 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-4xl">
            House of Qalakari Journal
          </h1>
          <p className="mt-2 text-xs text-muted lg:text-sm">
            Insights into the artistry of handwoven sarees, styling notes, and sustainable textiles.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] animate-pulse rounded-lg bg-chip" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="mt-8 text-center text-sm text-red-700">
            {error}
          </p>
        ) : blogs.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted">No blog posts published yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => {
              const snippet = (post.description || "")
                .replace(/<[^>]*>?/gm, "")
                .trim()
                .slice(0, 120);

              return (
                <article
                  key={post._id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-pine-950/10 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-chip">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linen text-xs text-muted">
                        House of Qalakari
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-inter text-[11px] text-muted">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : ""}
                    </span>
                    <h2 className="mt-2 font-display text-lg text-pine-950 transition-colors group-hover:text-pine-900">
                      {post.title}
                    </h2>
                    {snippet && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{snippet}...</p>}
                    <Link
                      href={`/blog/${post._id}`}
                      className="mt-4 inline-flex items-center gap-1 font-inter text-xs font-semibold text-pine-900 underline underline-offset-4 group-hover:text-pine-950"
                    >
                      Read story
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

