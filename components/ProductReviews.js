"use client";

import { useEffect, useState } from "react";
import { reviewsApi } from "@/lib/api/reviews";
import { apiConfigured } from "@/lib/api/client";
import Stars from "@/components/Stars";
import { reviews as seedReviews } from "@/lib/data";

function RatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={star <= value ? "#f9a000" : "none"} stroke="#f9a000" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ product }) {
  const [reviews, setReviews] = useState(product.id && /^[a-f\d]{24}$/i.test(String(product.id)) ? [] : seedReviews);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", rating: 5, title: "", body: "" });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (!apiConfigured || !/^[a-f\d]{24}$/i.test(String(product.id))) return;
    let active = true;
    reviewsApi.list(product.id).then(data => {
      if (active) setReviews((data.reviews || []).map(r => ({
        id:r._id, name:r.user?.name || r.userName || "Customer", rating:Number(r.rating)||0,
        title:r.title || "Review", body:r.comment || "", date:r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "", verified:Boolean(r.isVerifiedPurchase),
      })));
    }).catch(e => {if(active) setError(e.message);});
    return () => {active = false;};
  }, [product.id]);

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  async function submit(event) {
    event.preventDefault(); setError(null); setNotice("");
    if (!draft.name.trim() || !draft.title.trim() || !draft.body.trim()) {setError("Name, title and review are required."); return;}
    const isLive = apiConfigured && /^[a-f\d]{24}$/i.test(String(product.id));
    if (isLive) {
      setSending(true);
      try {
        await reviewsApi.create(product.id, {rating:draft.rating,title:draft.title,comment:draft.body,name:draft.name});
        setFormOpen(false);setNotice("Review submitted for moderation. It will appear after approval.");
        setDraft({name:"",rating:5,title:"",body:""});
      } catch (e) {setError(e.message);} finally {setSending(false);}
      return;
    }
    setReviews(current => [{id:Date.now(),name:draft.name.trim(),rating:draft.rating,title:draft.title,body:draft.body,date:new Date().toLocaleDateString("en-IN"),verified:false},...current]);
    setDraft({name:"",rating:5,title:"",body:""});setFormOpen(false);
  }

  return (
    <section aria-label="Customer reviews" className="mt-12 border-t border-pine-950/10 pt-8 lg:mt-16">
      {notice && <p role="status" className="mb-4 text-xs text-pine-900">{notice}</p>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-pine-950">
            Ratings &amp; reviews
          </h2>
          <p className="mt-1 text-xs text-muted">
            {product.reviews} ratings · {reviews.length} written reviews
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((open) => !open)}
          aria-expanded={formOpen}
          className="h-9 rounded-md border border-pine-900 px-3.5 font-inter text-[11px] font-semibold text-pine-900 transition-colors hover:bg-linen"
        >
          {formOpen ? "Close" : "Write a review"}
        </button>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <div className="rounded-lg bg-linen/60 p-4">
          <p className="font-display text-4xl font-semibold text-pine-950">{average.toFixed(1)}</p>
          <Stars rating={average} className="mt-1" />
          <ul className="mt-3 space-y-1.5">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-2">
                <span className="w-8 font-inter text-[10px] text-muted">{row.star} ★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-pine-950/10">
                  <span
                    className="block h-full rounded-full bg-[#f9a000]"
                    style={{ width: `${reviews.length ? (row.count / reviews.length) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-4 text-right font-inter text-[10px] tabular-nums text-muted">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {formOpen ? (
            <form onSubmit={submit} className="mb-6 rounded-lg border border-pine-950/15 p-4">
              <p className="font-inter text-[12px] font-semibold text-pine-950">Your review</p>
              <div className="mt-2 flex items-center gap-3">
                <RatingInput value={draft.rating} onChange={(rating) => setDraft({ ...draft, rating })} />
                <span className="text-[11px] text-muted">{draft.rating} / 5</span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="h-9 rounded-md border border-pine-950/20 px-2.5 text-[12px] outline-none focus:border-pine-900"
                />
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Review title"
                  aria-label="Review title"
                  className="h-9 rounded-md border border-pine-950/20 px-2.5 text-[12px] outline-none focus:border-pine-900"
                />
              </div>

              <textarea
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                placeholder="How was the weave, the colour, the fit?"
                aria-label="Your review"
                rows={3}
                className="mt-2 w-full rounded-md border border-pine-950/20 px-2.5 py-2 text-[12px] outline-none focus:border-pine-900"
              />

              {error ? (
                <p role="alert" className="mt-1 text-[11px] text-[#b42318]">{error}</p>
              ) : null}

              <button
                type="submit"
                className="mt-3 h-9 rounded-md bg-pine-900 px-4 font-inter text-[11px] font-semibold text-white transition-colors hover:bg-pine-950"
              >
                Submit review
              </button>
            </form>
          ) : null}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No written reviews yet.</p>
          ) : (
            <ul className="divide-y divide-pine-950/10">
              {reviews.map((review) => (
                <li key={review.id} className="py-4 first:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage font-inter text-[11px] font-semibold text-pine-900">
                      {review.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-inter text-[12px] font-semibold text-pine-950">
                        {review.name}
                        {review.verified ? (
                          <span className="ml-1.5 rounded bg-[#ecfdf3] px-1 py-[1px] align-middle font-inter text-[9px] font-semibold text-[#027a48]">
                            Verified buyer
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-muted">{review.date}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} className="mt-2" />
                  <p className="mt-1.5 text-[13px] font-medium text-black">{review.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}