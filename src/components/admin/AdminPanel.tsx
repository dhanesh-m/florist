"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAdminContentClient,
  invalidateAdminContentCache,
  type AdminContentDoc,
  type CategoryDoc,
  type ProductDoc,
  type TestimonialDoc,
} from "@/lib/admin-content-client";
import { saveAdminContent, uploadAdminImage } from "@/lib/admin-content-admin";
import {
  mergeAdminWithSiteDefaults,
  mergeHeroHeadlineString,
  normalizeHeroImageArray,
  SITE_CONTENT_DEFAULTS,
} from "@/lib/site-content-defaults";
import { slugify, uniqueProductSlug } from "@/lib/slug";
import { AdminImageUploadHint } from "@/components/admin/AdminImageUploadHint";

type AdminTab = "hero" | "marquee" | "categories" | "products" | "testimonials" | "about";

type CategoryForm = {
  name: string;
  sortOrder: number;
  description: string;
  imageFile: File | null;
  existingImageUrl: string | null;
  imageRemoved: boolean;
};

type ProductTags = "new" | "trending" | "exclusive" | "bestseller";

type ProductForm = {
  name: string;
  category: "Bouquet" | "Wedding" | "Custom";
  price: string;
  description: string;
  imageFile: File | null;
  /** Saved URL when editing (preview until replaced or removed). */
  existingImageUrl: string | null;
  /** User cleared preview — persist empty image on save. */
  imageRemoved: boolean;
  tags: Set<ProductTags>;
};

type TestimonialForm = {
  name: string;
  location: string;
  quote: string;
};

type AboutForm = {
  founderName: string;
  founderRole: string;
  p1: string;
  p2: string;
  p3: string;
  quote: string;
  imageFile: File | null;
  existingImageUrl: string | null;
  imageRemoved: boolean;
};

const KEY = "floral_admin_v2";

const PRODUCT_TAG_LIST: ProductTags[] = ["new", "trending", "exclusive", "bestseller"];

function productTagsFromDoc(tags?: string[]): Set<ProductTags> {
  const s = new Set<ProductTags>();
  for (const t of tags || []) {
    if (PRODUCT_TAG_LIST.includes(t as ProductTags)) s.add(t as ProductTags);
  }
  return s;
}

/**
 * Sets status + error toast. Returns true if there were errors (caller should return).
 * @param toastTitle Short title for the toast (e.g. "Can't save product").
 */
function reportValidationErrors(
  setStatus: (s: string) => void,
  errors: string[],
  toastTitle = "Can't save"
): boolean {
  const m = errors.map((e) => e.trim()).filter(Boolean);
  if (m.length === 0) return false;
  const msg = m.length === 1 ? m[0]! : `Please fix the following:\n${m.map((x) => `• ${x}`).join("\n")}`;
  setStatus(msg);
  toast.error(toastTitle, {
    description: m.length === 1 ? m[0]! : m.map((x) => `• ${x}`).join("\n"),
  });
  return true;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("hero");
  /** Same initial value on server and client — avoids hydration mismatch (e.g. hero “Choose image” vs “Edit image”). */
  const [state, setState] = useState<AdminContentDoc>(() => SITE_CONTENT_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [formsHydrated, setFormsHydrated] = useState(false);

  const [heroEyebrow, setHeroEyebrow] = useState(() => SITE_CONTENT_DEFAULTS.hero?.eyebrow ?? "");
  const [heroHeadline, setHeroHeadline] = useState(() =>
    mergeHeroHeadlineString(SITE_CONTENT_DEFAULTS.hero)
  );
  const [heroDescription, setHeroDescription] = useState(() => SITE_CONTENT_DEFAULTS.hero?.description ?? "");
  const [heroCtaText, setHeroCtaText] = useState(() => SITE_CONTENT_DEFAULTS.hero?.ctaText ?? "");
  const [heroImageFiles, setHeroImageFiles] = useState<(File | null)[]>([null, null]);
  const heroFileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null]);

  const [marqueeWords, setMarqueeWords] = useState<string[]>(() => [...(SITE_CONTENT_DEFAULTS.marquee?.words || [])]);
  const [marqueeVisible, setMarqueeVisible] = useState(SITE_CONTENT_DEFAULTS.marquee?.isVisible !== false);

  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    sortOrder: 1,
    description: "",
    imageFile: null,
    existingImageUrl: null,
    imageRemoved: false,
  });
  const [categoryEditingId, setCategoryEditingId] = useState<string | null>(null);
  const categoryFormSectionRef = useRef<HTMLDivElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const [categoryFileObjectUrl, setCategoryFileObjectUrl] = useState<string | null>(null);

  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    category: "Bouquet",
    price: "",
    description: "",
    imageFile: null,
    existingImageUrl: null,
    imageRemoved: false,
    tags: new Set<ProductTags>(),
  });
  const [productEditingId, setProductEditingId] = useState<string | null>(null);
  const [productSaving, setProductSaving] = useState(false);
  const productFormSectionRef = useRef<HTMLDivElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const [productFileObjectUrl, setProductFileObjectUrl] = useState<string | null>(null);

  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>({
    name: "",
    location: "",
    quote: "",
  });
  const [testimonialEditingId, setTestimonialEditingId] = useState<string | null>(null);
  const [testimonialSaving, setTestimonialSaving] = useState(false);

  const [aboutForm, setAboutForm] = useState<AboutForm>({
    founderName: "",
    founderRole: "",
    p1: "",
    p2: "",
    p3: "",
    quote: "",
    imageFile: null,
    existingImageUrl: SITE_CONTENT_DEFAULTS.about?.image?.trim() || null,
    imageRemoved: false,
  });
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [aboutFileObjectUrl, setAboutFileObjectUrl] = useState<string | null>(null);

  const tabs = useMemo(
    () =>
      [
        { id: "hero" as const, label: "Hero" },
        { id: "marquee" as const, label: "Marquee" },
        { id: "categories" as const, label: "By Category" },
        { id: "products" as const, label: "Collections" },
        { id: "testimonials" as const, label: "Testimonials" },
        { id: "about" as const, label: "About Us" },
      ] as const,
    []
  );

  useEffect(() => {
    // Source of truth: Firestore via API. Sync localStorage after load so refresh matches the live site.
    let mounted = true;
    const p = getAdminContentClient(true);
    p.then((doc) => {
      if (!mounted) return;
      const merged = mergeAdminWithSiteDefaults(doc);
      setState(merged);
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ ...merged, updatedAt: new Date().toISOString() })
        );
      } catch (e) {
        console.warn("Could not sync admin content to localStorage", e);
      }
    }).finally(() => {
      if (!mounted) return;
      setCloudLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Keep form inputs in sync with loaded state (but don’t wipe user edits during active usage).
    if (!cloudLoaded || formsHydrated) return;
    setHeroEyebrow(state.hero?.eyebrow || "");
    setHeroHeadline(mergeHeroHeadlineString(state.hero));
    setHeroDescription(state.hero?.description || "");
    setHeroCtaText(state.hero?.ctaText || "");

    setCategoryForm((prev) => ({
      ...prev,
      sortOrder: state.categories?.[0]?.sortOrder ?? prev.sortOrder,
    }));

    setAboutForm({
      founderName: state.about?.founderName || "",
      founderRole: state.about?.founderRole || "",
      p1: state.about?.p1 || "",
      p2: state.about?.p2 || "",
      p3: state.about?.p3 || "",
      quote: state.about?.quote || "",
      imageFile: null,
      existingImageUrl: state.about?.image?.trim() || null,
      imageRemoved: false,
    });

    const mw = state.marquee?.words;
    setMarqueeWords(
      Array.isArray(mw) && mw.length > 0 ? [...mw] : [...(SITE_CONTENT_DEFAULTS.marquee?.words || [])]
    );
    setMarqueeVisible(state.marquee?.isVisible !== false);

    setFormsHydrated(true);
  }, [cloudLoaded, formsHydrated, state]);

  const persistLocal = (next: AdminContentDoc) => {
    const payload = { ...next, updatedAt: new Date().toISOString() };
    setState(payload);
    localStorage.setItem(KEY, JSON.stringify(payload));
  };

  const onSave = async (next: AdminContentDoc, message: string): Promise<boolean> => {
    setSaving(true);
    setStatus("");
    try {
      persistLocal(next);
      await saveAdminContent(next);
      invalidateAdminContentCache();
      setStatus(message);
      toast.success(message);
      return true;
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error ? e.message : String(e);
      setStatus(`Save failed: ${detail}`);
      toast.error("Save failed", { description: detail });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const [heroFileObjectUrls, setHeroFileObjectUrls] = useState<(string | null)[]>([null, null]);
  /** Shared full-size image preview (hero, products, about). */
  const [imagePreviewModalSrc, setImagePreviewModalSrc] = useState<string | null>(null);

  useEffect(() => {
    const urls = heroImageFiles.map((f) => (f ? URL.createObjectURL(f) : null));
    setHeroFileObjectUrls(urls);
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [heroImageFiles]);

  useEffect(() => {
    if (!productForm.imageFile) {
      setProductFileObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(productForm.imageFile);
    setProductFileObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [productForm.imageFile]);

  const productPreviewSrc = useMemo(() => {
    if (productForm.imageRemoved) return null;
    return productFileObjectUrl || productForm.existingImageUrl || null;
  }, [productFileObjectUrl, productForm.existingImageUrl, productForm.imageRemoved]);

  useEffect(() => {
    if (!categoryForm.imageFile) {
      setCategoryFileObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(categoryForm.imageFile);
    setCategoryFileObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [categoryForm.imageFile]);

  const categoryPreviewSrc = useMemo(() => {
    if (categoryForm.imageRemoved) return null;
    return categoryFileObjectUrl || categoryForm.existingImageUrl || null;
  }, [categoryFileObjectUrl, categoryForm.existingImageUrl, categoryForm.imageRemoved]);

  useEffect(() => {
    if (!aboutForm.imageFile) {
      setAboutFileObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(aboutForm.imageFile);
    setAboutFileObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [aboutForm.imageFile]);

  const aboutPreviewSrc = useMemo(() => {
    if (aboutForm.imageRemoved) return null;
    return aboutFileObjectUrl || aboutForm.existingImageUrl || null;
  }, [aboutFileObjectUrl, aboutForm.existingImageUrl, aboutForm.imageRemoved]);

  const heroCanSave = useMemo(() => {
    const defaults = SITE_CONTENT_DEFAULTS.hero?.heroImages || [];
    const normalized = normalizeHeroImageArray(state.hero?.heroImages, defaults);
    return [0, 1].every((i) => {
      if (heroImageFiles[i]) return true;
      const u = normalized[i];
      const fallback = typeof defaults[i] === "string" ? defaults[i] : "";
      const effective = typeof u === "string" && u.trim().length > 0 ? u : fallback;
      return typeof effective === "string" && effective.trim().length > 0;
    });
  }, [state.hero?.heroImages, heroImageFiles]);

  useEffect(() => {
    setImagePreviewModalSrc(null);
  }, [activeTab]);

  useEffect(() => {
    if (!imagePreviewModalSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImagePreviewModalSrc(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [imagePreviewModalSrc]);

  async function saveMarquee() {
    const words = marqueeWords.map((w) => w.trim()).filter(Boolean);
    if (words.length === 0) {
      setStatus("Add at least one marquee word.");
      toast.error("Can't save marquee", { description: "Add at least one word before saving." });
      return;
    }
    await onSave(
      {
        ...state,
        marquee: {
          words,
          speedSeconds: SITE_CONTENT_DEFAULTS.marquee?.speedSeconds ?? 25,
          textColor: SITE_CONTENT_DEFAULTS.marquee?.textColor ?? "#b76b69",
          isVisible: marqueeVisible,
        },
      },
      "Marquee saved."
    );
  }

  function collectHeroValidationErrors(): string[] {
    const errors: string[] = [];
    if (!heroEyebrow.trim()) errors.push("Eyebrow text is required.");
    if (!heroHeadline.trim()) errors.push("Headline is required.");
    if (!heroDescription.trim()) errors.push("Description is required.");
    if (!heroCtaText.trim()) errors.push("CTA text is required.");
    const defaults = SITE_CONTENT_DEFAULTS.hero?.heroImages || [];
    const normalized = normalizeHeroImageArray(state.hero?.heroImages, defaults);
    for (let i = 0; i < 2; i++) {
      if (heroImageFiles[i]) continue;
      const u = normalized[i];
      const fallback = typeof defaults[i] === "string" ? defaults[i] : "";
      const effective = typeof u === "string" && u.trim().length > 0 ? u : fallback;
      if (!(typeof effective === "string" && effective.trim().length > 0)) {
        errors.push(i === 0 ? "Main hero image is required." : "Accent image is required.");
      }
    }
    return errors;
  }

  async function saveHero() {
    const validationErrors = collectHeroValidationErrors();
    if (validationErrors.length) {
      toast.error("Can't save hero", {
        description:
          validationErrors.length === 1
            ? validationErrors[0]
            : validationErrors.map((e) => `• ${e}`).join("\n"),
      });
      return;
    }

    const heroRest = { ...(state.hero || {}) } as Record<string, unknown>;
    delete heroRest.headline1;
    delete heroRest.headline2;
    const defaults = SITE_CONTENT_DEFAULTS.hero?.heroImages || [];
    const urls = normalizeHeroImageArray(state.hero?.heroImages, defaults);
    for (let i = 0; i < 2; i++) {
      if (heroImageFiles[i]) {
        urls[i] = await uploadAdminImage(heroImageFiles[i]!);
      }
    }
    const next: AdminContentDoc = {
      ...state,
      hero: {
        ...(heroRest as AdminContentDoc["hero"]),
        eyebrow: heroEyebrow.trim(),
        headline: heroHeadline.trim(),
        description: heroDescription.trim(),
        ctaText: heroCtaText.trim(),
        heroImages: urls,
      },
    };

    const ok = await onSave(next, "Hero saved.");
    if (ok) setHeroImageFiles([null, null]);
  }

  function resetCategoryForm() {
    setCategoryEditingId(null);
    setCategoryForm({
      name: "",
      sortOrder: 1,
      description: "",
      imageFile: null,
      existingImageUrl: null,
      imageRemoved: false,
    });
    if (categoryImageInputRef.current) categoryImageInputRef.current.value = "";
  }

  async function upsertCategory() {
    setStatus("");
    const name = categoryForm.name.trim();
    const description = categoryForm.description.trim();

    const categories: CategoryDoc[] = (state.categories || []).filter(Boolean);
    let existingIdx = -1;
    if (categoryEditingId) {
      existingIdx = categories.findIndex((c) => c?.id === categoryEditingId);
    }
    if (existingIdx < 0) {
      existingIdx = categories.findIndex((c) => (c.name || "").trim() === name);
    }

    let nextImageUrl = "";
    if (categoryForm.imageFile) {
      nextImageUrl = await uploadAdminImage(categoryForm.imageFile);
    } else if (categoryForm.imageRemoved) {
      nextImageUrl = "";
    } else if (categoryForm.existingImageUrl) {
      nextImageUrl = categoryForm.existingImageUrl;
    } else if (existingIdx >= 0) {
      nextImageUrl = categories[existingIdx]?.imageUrl || "";
    }

    const catErrors: string[] = [];
    if (!name) catErrors.push("Category name is required.");
    if (!description) catErrors.push("Category description is required.");
    if (!nextImageUrl.trim()) {
      catErrors.push("Category image is required. Upload an image or keep the existing preview.");
    }
    if (reportValidationErrors(setStatus, catErrors, "Can't save category")) return;

    if (existingIdx >= 0) {
      const existing = categories[existingIdx];
      const nextSlug = uniqueProductSlug(slugify(name), categories, existing.id);
      categories[existingIdx] = {
        ...existing,
        name,
        slug: nextSlug,
        description,
        sortOrder: categoryForm.sortOrder || 0,
        imageUrl: nextImageUrl,
        isVisible: true,
      };
    } else {
      const slug = uniqueProductSlug(slugify(name), categories);
      categories.push({
        id: crypto.randomUUID(),
        name,
        slug,
        description,
        sortOrder: categoryForm.sortOrder || 0,
        imageUrl: nextImageUrl,
        isVisible: true,
      });
    }

    const ok = await onSave(
      { ...state, categories },
      categoryEditingId ? "Category updated." : "Category saved."
    );
    if (ok) resetCategoryForm();
  }

  function selectedProductTags() {
    return Array.from(productForm.tags.values());
  }

  function resetProductForm() {
    setProductEditingId(null);
    setProductForm({
      name: "",
      category: "Bouquet",
      price: "",
      description: "",
      imageFile: null,
      existingImageUrl: null,
      imageRemoved: false,
      tags: new Set<ProductTags>(),
    });
    if (productImageInputRef.current) productImageInputRef.current.value = "";
  }

  async function upsertProduct() {
    setStatus("");
    const name = productForm.name.trim();
    const priceNum = Number(productForm.price || 0);
    const products: ProductDoc[] = (state.products || []).filter(Boolean);
    let existingIdx = -1;
    if (productEditingId) {
      existingIdx = products.findIndex((p) => p?.id === productEditingId);
    }
    if (existingIdx < 0) {
      existingIdx = products.findIndex((p) => (p.name || "").trim() === name);
    }

    const errors: string[] = [];
    if (!name) errors.push("Item name is required.");
    if (!productForm.description.trim()) errors.push("Description is required.");
    if (!productForm.price.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      errors.push("A valid starting price is required.");
    }
    const hasImage =
      Boolean(productForm.imageFile) ||
      (!productForm.imageRemoved && Boolean(productForm.existingImageUrl?.trim())) ||
      (!productForm.imageRemoved &&
        existingIdx >= 0 &&
        Boolean(products[existingIdx]?.imageUrl?.trim()));
    if (!hasImage) errors.push("Product image is required.");
    if (reportValidationErrors(setStatus, errors, "Can't save collection item")) return;

    setProductSaving(true);
    try {
      let nextImageUrl = "";
      if (productForm.imageFile) {
        nextImageUrl = await uploadAdminImage(productForm.imageFile);
      } else if (productForm.imageRemoved) {
        nextImageUrl = "";
      } else if (productForm.existingImageUrl) {
        nextImageUrl = productForm.existingImageUrl;
      } else if (existingIdx >= 0) {
        nextImageUrl = products[existingIdx]?.imageUrl || "";
      }

      if (existingIdx >= 0) {
        const existing = products[existingIdx];
        const nextSlug = uniqueProductSlug(slugify(name), products, existing.id);
        products[existingIdx] = {
          ...existing,
          slug: nextSlug,
          name,
          description: productForm.description.trim(),
          category: productForm.category,
          price: Number.isFinite(priceNum) ? priceNum : 0,
          tags: selectedProductTags(),
          imageUrl: nextImageUrl,
          isVisible: true,
        };
      } else {
        const base = slugify(name);
        const slug = uniqueProductSlug(base, products);
        products.push({
          id: crypto.randomUUID(),
          slug,
          name,
          description: productForm.description.trim(),
          category: productForm.category,
          price: Number.isFinite(priceNum) ? priceNum : 0,
          tags: selectedProductTags(),
          imageUrl: nextImageUrl,
          isVisible: true,
        });
      }

      const ok = await onSave(
        { ...state, products },
        productEditingId ? "Product updated." : "Product saved."
      );
      if (ok) resetProductForm();
    } finally {
      setProductSaving(false);
    }
  }

  function resetTestimonialForm() {
    setTestimonialEditingId(null);
    setTestimonialForm({
      name: "",
      location: "",
      quote: "",
    });
  }

  async function saveTestimonial() {
    setStatus("");
    const name = testimonialForm.name.trim();
    const location = testimonialForm.location.trim();
    const quote = testimonialForm.quote.trim();
    const testimonialErrors: string[] = [];
    if (!name) testimonialErrors.push("Client name is required.");
    if (!quote) testimonialErrors.push("Quote is required.");
    if (reportValidationErrors(setStatus, testimonialErrors, "Can't save testimonial")) return;

    const testimonials: TestimonialDoc[] = (state.testimonials || []).filter(Boolean);

    if (testimonialEditingId) {
      const idx = testimonials.findIndex((t) => t?.id === testimonialEditingId);
      if (idx >= 0) {
        const prev = testimonials[idx]!;
        testimonials[idx] = {
          ...prev,
          name,
          location,
          quote,
          imageUrl: "",
          isVisible: true,
        };
      }
    } else {
      testimonials.unshift({
        id: crypto.randomUUID(),
        name,
        location,
        quote,
        imageUrl: "",
        isVisible: true,
      });
    }

    setTestimonialSaving(true);
    try {
      const ok = await onSave(
        { ...state, testimonials },
        testimonialEditingId ? "Testimonial updated." : "Testimonial added."
      );
      if (ok) resetTestimonialForm();
    } finally {
      setTestimonialSaving(false);
    }
  }

  async function saveAbout() {
    setStatus("");
    const errors: string[] = [];
    if (!aboutForm.founderName.trim()) errors.push("Founder name is required.");
    if (!aboutForm.founderRole.trim()) errors.push("Founder role is required.");
    if (!aboutForm.p1.trim()) errors.push("Paragraph 1 is required.");
    if (!aboutForm.p2.trim()) errors.push("Paragraph 2 is required.");
    if (!aboutForm.p3.trim()) errors.push("Paragraph 3 is required.");
    if (!aboutForm.quote.trim()) errors.push("Quote is required.");
    const prevImg = state.about?.image?.trim() || "";
    const hasAboutImage =
      Boolean(aboutForm.imageFile) ||
      (!aboutForm.imageRemoved && Boolean(aboutForm.existingImageUrl?.trim())) ||
      (!aboutForm.imageRemoved && Boolean(prevImg));
    if (!hasAboutImage) errors.push("About image is required.");
    if (reportValidationErrors(setStatus, errors, "Can't save About")) return;

    let imageUrl = "";
    if (aboutForm.imageFile) {
      imageUrl = await uploadAdminImage(aboutForm.imageFile);
    } else if (aboutForm.imageRemoved) {
      imageUrl = "";
    } else if (aboutForm.existingImageUrl) {
      imageUrl = aboutForm.existingImageUrl;
    } else {
      imageUrl = prevImg;
    }

    const next: AdminContentDoc = {
      ...state,
      about: {
        ...(state.about || {}),
        founderName: aboutForm.founderName.trim(),
        founderRole: aboutForm.founderRole.trim(),
        p1: aboutForm.p1.trim(),
        p2: aboutForm.p2.trim(),
        p3: aboutForm.p3.trim(),
        quote: aboutForm.quote.trim(),
        image: imageUrl,
      },
    };

    const ok = await onSave(next, "About saved.");
    if (ok) {
      setAboutForm((prev) => ({
        ...prev,
        imageFile: null,
        existingImageUrl: imageUrl || null,
        imageRemoved: false,
      }));
      if (aboutImageInputRef.current) aboutImageInputRef.current.value = "";
    }
  }

  function resetAboutFormFromState() {
    const a = state.about;
    const d = SITE_CONTENT_DEFAULTS.about;
    setAboutForm({
      founderName: a?.founderName || d?.founderName || "",
      founderRole: a?.founderRole || d?.founderRole || "",
      p1: a?.p1 || d?.p1 || "",
      p2: a?.p2 || d?.p2 || "",
      p3: a?.p3 || d?.p3 || "",
      quote: a?.quote || d?.quote || "",
      imageFile: null,
      existingImageUrl: (a?.image || d?.image || "").trim() || null,
      imageRemoved: false,
    });
    if (aboutImageInputRef.current) aboutImageInputRef.current.value = "";
    setStatus("");
  }

  async function deleteCategory(id?: string) {
    if (!id) return;
    if (categoryEditingId === id) resetCategoryForm();
    const nextCategories = (state.categories || []).filter((c) => c?.id !== id);
    await onSave({ ...state, categories: nextCategories }, "Category deleted.");
  }

  async function deleteProduct(id?: string) {
    if (!id) return;
    if (productEditingId === id) resetProductForm();
    const nextProducts = (state.products || []).filter((p) => p?.id !== id);
    await onSave({ ...state, products: nextProducts }, "Product deleted.");
  }

  async function deleteTestimonial(id?: string) {
    if (!id) return;
    if (testimonialEditingId === id) resetTestimonialForm();
    const nextTestimonials = (state.testimonials || []).filter((t) => t?.id !== id);
    await onSave({ ...state, testimonials: nextTestimonials }, "Testimonial deleted.");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="pt-8">
        <div className="flex items-start gap-6">
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="rounded-3xl border border-beige-200/70 bg-white/80 shadow-soft p-5">
              <h1 className="font-display text-2xl">Floral Doctor</h1>
              <p className="text-beige-600 text-sm mt-1">Admin Panel</p>

              <div className="mt-6 space-y-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    className={`w-full text-left px-3 py-2 rounded-2xl border transition-all ${
                      activeTab === t.id
                        ? "bg-[#faf9f7] border-beige-200/90"
                        : "bg-transparent border-transparent hover:border-beige-200/70"
                    }`}
                    onClick={() => setActiveTab(t.id)}
                    type="button"
                  >
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="rounded-3xl border border-beige-200/70 bg-white/80 shadow-soft p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-display text-3xl">Admin Content</h2>
                  <p className="text-beige-600 text-sm mt-1">Updates sync to the live website.</p>
                </div>
                <div className="text-sm text-beige-600">
                  {saving ? "Saving..." : status ? status : "Ready"}
                </div>
              </div>

              <div className="mt-6 md:hidden grid grid-cols-2 gap-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    className={`px-3 py-2 rounded-2xl border text-sm transition-all ${
                      activeTab === t.id
                        ? "bg-[#faf9f7] border-beige-200/90"
                        : "bg-white/60 border-beige-200/50 hover:border-beige-200/90"
                    }`}
                    onClick={() => setActiveTab(t.id)}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* HERO */}
              {activeTab === "hero" && (
                <section className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Eyebrow text</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={heroEyebrow}
                        onChange={(e) => setHeroEyebrow(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">CTA text</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={heroCtaText}
                        onChange={(e) => setHeroCtaText(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-beige-600 mb-1">Headline</label>
                      <textarea
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[88px]"
                        value={heroHeadline}
                        onChange={(e) => setHeroHeadline(e.target.value)}
                        rows={3}
                        placeholder={"Art in\nBloom"}
                      />
                      <p className="text-xs text-beige-500 mt-1.5">
                        Optional line break: text above the break is the main line; the line below uses the accent
                        style (italic gold) on the site.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-beige-600 mb-1">Description</label>
                    <textarea
                      className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[110px]"
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                    />
                  </div>

                  <p className="text-sm text-beige-600">
                    Two images: one large main image and one smaller floating accent on the top-right (matches the
                    homepage hero). Both are required before you can save.
                  </p>
                  <div className="mt-1.5">
                    <AdminImageUploadHint />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1].map((i) => {
                      const file = heroImageFiles[i];
                      const label = i === 0 ? "Main hero image" : "Accent image (top)";
                      const savedUrl = state.hero?.heroImages?.[i];
                      const defaultSlot = SITE_CONTENT_DEFAULTS.hero?.heroImages?.[i];
                      const fromSaved = typeof savedUrl === "string" && savedUrl.trim() ? savedUrl : "";
                      const fromDefault =
                        typeof defaultSlot === "string" && defaultSlot.trim() ? defaultSlot : "";
                      const previewSrc = heroFileObjectUrls[i] || fromSaved || fromDefault || null;
                      return (
                        <div key={i}>
                          <label className="block text-sm text-beige-600 mb-1">{label}</label>
                          <input
                            ref={(el) => {
                              heroFileInputRefs.current[i] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            tabIndex={-1}
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setHeroImageFiles((prev) => {
                                const next = [...prev];
                                next[i] = f;
                                return next;
                              });
                            }}
                          />
                          <div className="rounded-2xl border border-dashed border-beige-200/90 px-3 py-2.5 bg-white min-h-[3rem] flex items-center gap-2">
                            {file ? (
                              <>
                                <p
                                  className="flex-1 min-w-0 text-sm text-[#2a2521] break-words"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                                <button
                                  type="button"
                                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-beige-200 text-beige-600 hover:bg-beige-50 hover:text-[#2a2521] text-lg leading-none"
                                  aria-label={`Remove ${file.name}`}
                                  onClick={() => {
                                    setHeroImageFiles((prev) => {
                                      const next = [...prev];
                                      next[i] = null;
                                      return next;
                                    });
                                    const input = heroFileInputRefs.current[i];
                                    if (input) input.value = "";
                                  }}
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="w-full text-left text-sm font-medium text-[#b89164] hover:text-[#9f774d] py-1"
                                onClick={() => heroFileInputRefs.current[i]?.click()}
                              >
                                {previewSrc ? "Edit image" : "Choose image"}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-beige-500 mt-1.5">Current image</p>
                          {previewSrc ? (
                            <button
                              type="button"
                              className="group relative mt-1 w-full max-w-full rounded-2xl border border-beige-200/60 bg-white aspect-square max-h-44 overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89164]/50"
                              aria-label={`View ${label} preview`}
                              onClick={() => setImagePreviewModalSrc(previewSrc)}
                            >
                              <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                              <span
                                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/45 group-hover:opacity-100"
                                aria-hidden
                              >
                                <span className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-[#2a2521] shadow-sm">
                                  View
                                </span>
                              </span>
                            </button>
                          ) : (
                            <p className="mt-1 text-xs text-beige-400 italic">No image yet</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-3 items-center">
                      <button
                        type="button"
                        onClick={saveHero}
                        disabled={saving}
                        className="px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-45 disabled:cursor-not-allowed text-white font-medium transition-colors"
                      >
                        {saving ? "Saving…" : "Save Hero"}
                      </button>
                    </div>
                    {!heroCanSave ||
                    !heroEyebrow.trim() ||
                    !heroHeadline.trim() ||
                    !heroDescription.trim() ||
                    !heroCtaText.trim() ? (
                      <p className="text-sm text-amber-900/90">
                        Fill eyebrow, headline, description, CTA, and both hero images before saving.
                      </p>
                    ) : null}
                  </div>
                </section>
              )}

              {/* MARQUEE — scrolling word strip on the homepage */}
              {activeTab === "marquee" && (
                <section className="mt-6 space-y-4">
                  <p className="text-sm text-beige-600">
                    The horizontal scrolling text band below the hero (e.g. Roses, Bouquets, Weddings).
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-beige-700">
                      <input
                        type="checkbox"
                        className="rounded border-beige-300"
                        checked={marqueeVisible}
                        onChange={(e) => setMarqueeVisible(e.target.checked)}
                      />
                      Show marquee on the site
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-2">Words (order = scroll order)</label>
                    <div className="space-y-2">
                      {marqueeWords.map((word, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            className="flex-1 rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                            value={word}
                            placeholder="e.g. Fresh Blooms"
                            onChange={(e) => {
                              const v = e.target.value;
                              setMarqueeWords((prev) => {
                                const next = [...prev];
                                next[index] = v;
                                return next;
                              });
                            }}
                          />
                          <button
                            type="button"
                            className="shrink-0 px-3 py-2 rounded-xl border border-beige-200 text-beige-700 hover:bg-beige-50 text-sm"
                            onClick={() => setMarqueeWords((prev) => prev.filter((_, i) => i !== index))}
                            aria-label="Remove word"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-3 px-4 py-2 rounded-2xl border border-dashed border-beige-300 text-beige-700 hover:bg-[#faf9f7] text-sm"
                      onClick={() => setMarqueeWords((prev) => [...prev, ""])}
                    >
                      + Add word
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={saveMarquee}
                      className="px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] text-white font-medium transition-colors"
                    >
                      Save Marquee
                    </button>
                  </div>
                </section>
              )}

              {/* CATEGORIES */}
              {activeTab === "categories" && (
                <section className="mt-6 space-y-4">
                  <div
                    ref={categoryFormSectionRef}
                    className="scroll-mt-24 space-y-4 rounded-2xl border border-beige-200/60 bg-[#faf9f7]/50 p-4 sm:p-6"
                  >
                    <h3 className="font-display text-xl text-[#2a2521]">
                      {categoryEditingId ? "Edit category" : "Add category"}
                    </h3>
                    <p className="text-sm text-beige-600">
                      Name, description, and main image are required before saving.
                    </p>
                    <div className="mt-1.5">
                      <AdminImageUploadHint />
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">
                        Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                      />
                      <p className="text-xs text-beige-500 mt-1.5">
                        Collection filter links use a URL key derived from this name (e.g. &quot;Wedding Florals&quot; →{" "}
                        <span className="font-mono text-beige-600">?category=wedding-florals</span>).
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Sort order</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={categoryForm.sortOrder}
                        onChange={(e) => setCategoryForm((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-1">
                      Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[95px]"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">
                        Main tag image <span className="text-red-600">*</span>
                      </label>
                      <input
                        ref={categoryImageInputRef}
                        type="file"
                        accept="image/*"
                        className="w-full rounded-2xl border border-dashed border-beige-200/90 px-4 py-2 bg-white"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setCategoryForm((p) => ({ ...p, imageFile: f, imageRemoved: false }));
                        }}
                      />
                      {categoryPreviewSrc ? (
                        <div className="relative mt-3 inline-block max-w-full">
                          <div className="rounded-2xl overflow-hidden border border-beige-200/70 bg-white max-h-56 w-56">
                            <img
                              src={categoryPreviewSrc}
                              alt=""
                              className="w-full h-full max-h-56 object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-beige-200 bg-white/95 text-beige-800 shadow-sm hover:bg-beige-50 text-lg leading-none"
                            aria-label="Remove image"
                            onClick={() => {
                              setCategoryForm((p) => ({
                                ...p,
                                imageFile: null,
                                existingImageUrl: null,
                                imageRemoved: true,
                              }));
                              if (categoryImageInputRef.current) categoryImageInputRef.current.value = "";
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:flex-wrap">
                      <button
                        type="button"
                        onClick={upsertCategory}
                        className="px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] text-white font-medium transition-colors"
                      >
                        {categoryEditingId ? "Save changes" : "Add / Update Category"}
                      </button>
                      {categoryEditingId ? (
                        <button
                          type="button"
                          onClick={() => {
                            resetCategoryForm();
                            setStatus("");
                          }}
                          className="px-6 py-3 rounded-2xl border border-beige-200/90 text-beige-700 hover:bg-beige-50 font-medium transition-colors"
                        >
                          Cancel edit
                        </button>
                      ) : null}
                    </div>
                  </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-lg">Saved Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(state.categories || []).map((c) => (
                        <div key={c?.id || c?.slug} className="rounded-2xl border border-beige-200/70 bg-white/70 overflow-hidden">
                          <div className="flex gap-3 p-4 items-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-beige-200/60 bg-white">
                              {c?.imageUrl ? (
                                <img src={c.imageUrl} alt={c.name || "Category"} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[#2a2521] truncate">{c?.name}</div>
                              <div className="text-sm text-beige-600 truncate">Order {c?.sortOrder ?? 0}</div>
                              <div className="text-sm text-beige-700 mt-1 line-clamp-2">{c?.description}</div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-beige-200 text-beige-800 hover:bg-beige-50 text-sm"
                                onClick={() => {
                                  if (!c?.id) return;
                                  setCategoryEditingId(c.id);
                                  setCategoryForm({
                                    name: c.name || "",
                                    sortOrder: c.sortOrder ?? 1,
                                    description: c.description || "",
                                    imageFile: null,
                                    existingImageUrl: c.imageUrl?.trim() || null,
                                    imageRemoved: false,
                                  });
                                  setStatus("");
                                  if (categoryImageInputRef.current) categoryImageInputRef.current.value = "";
                                  window.requestAnimationFrame(() => {
                                    categoryFormSectionRef.current?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                onClick={() => deleteCategory(c?.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* PRODUCTS */}
              {activeTab === "products" && (
                <section className="mt-6 space-y-4">
                  <div
                    ref={productFormSectionRef}
                    className="scroll-mt-24 space-y-4 rounded-2xl border border-beige-200/60 bg-[#faf9f7]/50 p-4 sm:p-6"
                  >
                    <h3 className="font-display text-xl text-[#2a2521]">
                      {productEditingId ? "Edit collection item" : "Add collection item"}
                    </h3>
                    <p className="text-sm text-beige-600">
                      Name, description, price, and image are required before saving.
                    </p>
                    <div className="mt-1.5">
                      <AdminImageUploadHint />
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-beige-600 mb-1">Item name</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={productForm.name}
                        onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                      />
                      <p className="text-xs text-beige-500 mt-1.5">
                        The product link is generated from this name (e.g. &quot;Rose Elegance&quot; →{" "}
                        <span className="font-mono text-beige-600">/collection/rose-elegance</span>).
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Category type</label>
                      <select
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            category: e.target.value as ProductForm["category"],
                          }))
                        }
                      >
                        <option value="Bouquet">Bouquet</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Starting price from</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={productForm.price}
                        onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Image</label>
                      <input
                        ref={productImageInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        tabIndex={-1}
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setProductForm((p) => ({ ...p, imageFile: f, imageRemoved: false }));
                        }}
                      />
                      <div className="rounded-2xl border border-dashed border-beige-200/90 px-3 py-2.5 bg-white min-h-[3rem] flex items-center gap-2">
                        {productForm.imageFile ? (
                          <>
                            <p
                              className="flex-1 min-w-0 text-sm text-[#2a2521] break-words"
                              title={productForm.imageFile.name}
                            >
                              {productForm.imageFile.name}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-beige-200 text-beige-600 hover:bg-beige-50 text-lg leading-none"
                              aria-label="Remove file"
                              onClick={() => {
                                setProductForm((p) => ({ ...p, imageFile: null }));
                                if (productImageInputRef.current) productImageInputRef.current.value = "";
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left text-sm font-medium text-[#b89164] hover:text-[#9f774d] py-1"
                            onClick={() => productImageInputRef.current?.click()}
                          >
                            {productPreviewSrc ? "Edit image" : "Choose image"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-beige-500 mt-1.5">Current image</p>
                      {productPreviewSrc ? (
                        <button
                          type="button"
                          className="group relative mt-1 inline-block max-w-full rounded-2xl border border-beige-200/60 bg-white max-h-56 w-56 overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89164]/50"
                          aria-label="View product image"
                          onClick={() => setImagePreviewModalSrc(productPreviewSrc)}
                        >
                          <img src={productPreviewSrc} alt="" className="h-full w-full max-h-56 object-cover" />
                          <span
                            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/45 group-hover:opacity-100"
                            aria-hidden
                          >
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-[#2a2521] shadow-sm">
                              View
                            </span>
                          </span>
                        </button>
                      ) : (
                        <p className="mt-1 text-xs text-beige-400 italic">No image yet</p>
                      )}
                      {productPreviewSrc && !productForm.imageFile ? (
                        <button
                          type="button"
                          className="mt-2 text-sm text-red-600 hover:underline"
                          onClick={() => {
                            setProductForm((p) => ({
                              ...p,
                              imageFile: null,
                              existingImageUrl: null,
                              imageRemoved: true,
                            }));
                            if (productImageInputRef.current) productImageInputRef.current.value = "";
                          }}
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-1">Description</label>
                    <textarea
                      className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[95px]"
                      value={productForm.description}
                      onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT_TAG_LIST.map((t) => {
                        const checked = productForm.tags.has(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setProductForm((p) => {
                                const next = new Set(p.tags.values());
                                if (next.has(t)) next.delete(t);
                                else next.add(t);
                                return { ...p, tags: next };
                              });
                            }}
                            className={`px-3 py-2 rounded-2xl border text-sm transition-all ${
                              checked
                                ? "bg-[#faf9f7] border-beige-200/90"
                                : "bg-white/60 border-beige-200/50 hover:border-beige-200/90"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      type="button"
                      onClick={upsertProduct}
                      disabled={productSaving}
                      className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors"
                    >
                      {productSaving ? (
                        <>
                          <svg
                            className="h-4 w-4 shrink-0 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Saving…</span>
                        </>
                      ) : productEditingId ? (
                        "Update"
                      ) : (
                        "Add / Update Product"
                      )}
                    </button>
                    {productEditingId ? (
                      <button
                        type="button"
                        onClick={() => {
                          resetProductForm();
                          setStatus("");
                        }}
                        className="px-6 py-3 rounded-2xl border border-beige-200/90 text-beige-700 hover:bg-beige-50 font-medium transition-colors"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                    {productEditingId ? (
                      <span className="text-sm text-beige-600">Editing an existing item — save or cancel.</span>
                    ) : null}
                  </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-lg">Saved Collections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(state.products || []).map((p) => (
                        <div key={p?.id || p?.slug} className="rounded-2xl border border-beige-200/70 bg-white/70 overflow-hidden">
                          <div className="flex gap-3 p-4 items-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-beige-200/60 bg-white">
                              {p?.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name || "Product"} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[#2a2521] truncate">{p?.name}</div>
                              <div className="text-sm text-beige-600 truncate">{p?.category}</div>
                              <div className="text-sm text-gold-700 font-medium mt-1">
                                ${p?.price ?? 0} starting
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-beige-200 text-beige-800 hover:bg-beige-50 text-sm"
                                onClick={() => {
                                  if (!p?.id) return;
                                  setProductEditingId(p.id);
                                  setProductForm({
                                    name: p.name || "",
                                    category: (p.category as ProductForm["category"]) || "Bouquet",
                                    price: p.price != null ? String(p.price) : "",
                                    description: p.description || "",
                                    imageFile: null,
                                    existingImageUrl: p.imageUrl?.trim() || null,
                                    imageRemoved: false,
                                    tags: productTagsFromDoc(p.tags),
                                  });
                                  setStatus("");
                                  if (productImageInputRef.current) productImageInputRef.current.value = "";
                                  window.requestAnimationFrame(() => {
                                    productFormSectionRef.current?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                onClick={() => deleteProduct(p?.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* TESTIMONIALS */}
              {activeTab === "testimonials" && (
                <section className="mt-6 space-y-4">
                  {testimonialEditingId ? (
                    <h3 className="font-display text-lg text-[#2a2521]">
                      Editing a saved testimonial — save or cancel
                    </h3>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Client name</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={testimonialForm.name}
                        onChange={(e) => setTestimonialForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Location</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={testimonialForm.location}
                        onChange={(e) => setTestimonialForm((p) => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-1">Quote / Content</label>
                    <textarea
                      className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[95px]"
                      value={testimonialForm.quote}
                      onChange={(e) => setTestimonialForm((p) => ({ ...p, quote: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={saveTestimonial}
                      disabled={testimonialSaving}
                      className="inline-flex min-h-[48px] px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors w-full sm:w-auto items-center justify-center gap-2"
                    >
                      {testimonialSaving ? (
                        <>
                          <svg
                            className="h-4 w-4 shrink-0 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Saving…</span>
                        </>
                      ) : testimonialEditingId ? (
                        "Save changes"
                      ) : (
                        "Add Testimonial"
                      )}
                    </button>
                    {testimonialEditingId ? (
                      <button
                        type="button"
                        disabled={testimonialSaving}
                        onClick={() => {
                          resetTestimonialForm();
                          setStatus("");
                        }}
                        className="px-6 py-3 rounded-2xl border border-beige-200/90 text-beige-700 hover:bg-beige-50 font-medium transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-lg">Saved Testimonials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(state.testimonials || []).map((t) => (
                        <div key={t?.id || t?.name} className="rounded-2xl border border-beige-200/70 bg-white/70 overflow-hidden">
                          <div className="flex gap-3 p-4">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[#2a2521] truncate">{t?.name}</div>
                              <div className="text-sm text-beige-600 truncate">{t?.location}</div>
                              <div className="text-sm text-beige-700 mt-1 line-clamp-3">{t?.quote}</div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 self-start">
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-beige-200 text-beige-800 hover:bg-beige-50 text-sm"
                                onClick={() => {
                                  if (!t?.id) return;
                                  setTestimonialEditingId(t.id);
                                  setTestimonialForm({
                                    name: t.name || "",
                                    location: t.location || "",
                                    quote: t.quote || "",
                                  });
                                  setStatus("");
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                onClick={() => deleteTestimonial(t?.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ABOUT */}
              {activeTab === "about" && (
                <section className="mt-6 space-y-4">
                  <h3 className="font-display text-lg text-[#2a2521]">About page — text and image</h3>
                  <p className="text-sm text-beige-600">
                    All fields including the image are required before saving.
                  </p>
                  <div className="mt-1.5">
                    <AdminImageUploadHint />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Founder name</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={aboutForm.founderName}
                        onChange={(e) => setAboutForm((p) => ({ ...p, founderName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-beige-600 mb-1">Founder role</label>
                      <input
                        className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                        value={aboutForm.founderRole}
                        onChange={(e) => setAboutForm((p) => ({ ...p, founderRole: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(["p1", "p2", "p3"] as const).map((key) => {
                      const value = aboutForm[key];
                      return (
                        <div key={key}>
                          <label className="block text-sm text-beige-600 mb-1">{key.toUpperCase()}</label>
                          <textarea
                            className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white min-h-[85px]"
                            value={value}
                            onChange={(e) => setAboutForm((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-sm text-beige-600 mb-1">Quote</label>
                    <input
                      className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
                      value={aboutForm.quote}
                      onChange={(e) => setAboutForm((p) => ({ ...p, quote: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm text-beige-600 mb-1">About image</label>
                    <input
                      ref={aboutImageInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setAboutForm((p) => ({ ...p, imageFile: f, imageRemoved: false }));
                      }}
                    />
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
                      <div className="flex-1 min-w-0 rounded-2xl border border-dashed border-beige-200/90 px-3 py-2.5 bg-white min-h-[3rem] flex items-center gap-2">
                        {aboutForm.imageFile ? (
                          <>
                            <p
                              className="flex-1 min-w-0 text-sm text-[#2a2521] break-words"
                              title={aboutForm.imageFile.name}
                            >
                              {aboutForm.imageFile.name}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-beige-200 text-beige-600 hover:bg-beige-50 text-lg leading-none"
                              aria-label="Remove file"
                              onClick={() => {
                                setAboutForm((p) => ({ ...p, imageFile: null }));
                                if (aboutImageInputRef.current) aboutImageInputRef.current.value = "";
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left text-sm font-medium text-[#b89164] hover:text-[#9f774d] py-1"
                            onClick={() => aboutImageInputRef.current?.click()}
                          >
                            {aboutPreviewSrc ? "Edit image" : "Choose image"}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap shrink-0">
                        <button
                          type="button"
                          onClick={saveAbout}
                          className="px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] text-white font-medium transition-colors"
                        >
                          Save About
                        </button>
                        <button
                          type="button"
                          onClick={resetAboutFormFromState}
                          className="px-6 py-3 rounded-2xl border border-beige-200/90 text-beige-700 hover:bg-beige-50 font-medium transition-colors"
                        >
                          Cancel edit
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-beige-500">Preview — click to view full size</p>
                    {aboutPreviewSrc ? (
                      <button
                        type="button"
                        className="group relative block w-full max-w-2xl rounded-3xl border border-beige-200/60 overflow-hidden bg-white/70 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b89164]/50"
                        aria-label="View about image"
                        onClick={() => setImagePreviewModalSrc(aboutPreviewSrc)}
                      >
                        <img
                          src={aboutPreviewSrc}
                          alt="About preview"
                          className="w-full max-h-[420px] object-cover"
                        />
                        <span
                          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/40 group-hover:opacity-100"
                          aria-hidden
                        >
                          <span className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-[#2a2521] shadow-sm">
                            View
                          </span>
                        </span>
                      </button>
                    ) : (
                      <p className="text-xs text-beige-400 italic">No image yet</p>
                    )}
                    {aboutPreviewSrc && !aboutForm.imageFile ? (
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => {
                          setAboutForm((p) => ({
                            ...p,
                            imageFile: null,
                            existingImageUrl: null,
                            imageRemoved: true,
                          }));
                          if (aboutImageInputRef.current) aboutImageInputRef.current.value = "";
                        }}
                      >
                        Remove image
                      </button>
                    ) : null}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {imagePreviewModalSrc ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setImagePreviewModalSrc(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/95 px-4 py-2 text-sm font-medium text-[#2a2521] shadow-lg hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setImagePreviewModalSrc(null);
            }}
          >
            Close
          </button>
          <img
            src={imagePreviewModalSrc}
            alt=""
            className="max-h-[min(90vh,900px)] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

