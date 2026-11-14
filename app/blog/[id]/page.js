"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api/client";

export default function BlogPostPage({ params }) {
  const { id } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest(`/api/blog/${id}`)
      .then((data) => {
        if (!active) return;
        if (data.success && data.blog) {
          setPost(data.blog);
        } else {
          setError(data.message || "Post not found");
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
  }, [id]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[800px] flex-1 px-4 py-8 lg:px-6 lg:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-[11px] text-muted">
          <Link href="/" className="hover:text-pine-900">Home</Link>
          <span className="px-1.5">/</span>
          <Link href="/blog" className="hover:text-pine-900">Journal</Link>
          <span className="px-1.5">/</span>
          <span className="text-pine-900 font-medium">{post?.title || "Article"}</span>
        </nav>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-chip" />
            <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-chip" />
          </div>
        ) : error ? (
          <p role="alert" className="text-center text-sm text-red-700">{error}</p>
        ) : !post ? (
          <p className="text-center text-sm text-muted">Post not found.</p>
        ) : (
          <article className="prose prose-pine max-w-none">
            <span className="font-inter text-xs font-semibold uppercase tracking-widest text-pine-900">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : ""}
            </span>
            <h1 className="mt-2 font-display text-3xl text-pine-950 lg:text-4xl">
              {post.title}
            </h1>

            {post.image && (
              <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-chip">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div
              className="mt-6 text-sm leading-relaxed text-ink/90 [&_h1]:font-display [&_h1]:text-2xl [&_h2]:font-display [&_h2]:text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: post.description || "" }}
            />
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}

