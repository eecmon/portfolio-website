import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { PortfolioSection, SectionImage } from "@/api/contentApi";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

function ImageCarousel({ images }: { images: SectionImage[] }) {
  const [api, setApi] = useState<CarouselApi>();

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!api || images.length <= 1) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [api, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No images yet
      </div>
    );
  }

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {images.map((img) => (
          <CarouselItem key={img.id}>
            <figure className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={img.imageUrl}
                  alt={img.caption ?? ""}
                  className="h-64 w-full object-cover transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {img.caption && (
                <figcaption className="text-center text-xs text-muted-foreground">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </>
      )}
    </Carousel>
  );
}

export function ImageSection({ section }: SectionProps) {
  const images = ([...(section.data.images ?? [])] as SectionImage[]).sort(
    (a, b) => a.order - b.order
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      {/* Row 1: title + subtext */}
      <div className="mb-8 flex items-center gap-3">
        {section.iconUrl && (
          <img
            src={section.iconUrl}
            alt=""
            aria-hidden="true"
            className="size-7 shrink-0 object-contain"
          />
        )}
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            {section.title}
          </h2>
          {section.subtext && (
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              {section.subtext}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: description 3/5 + carousel 2/5 */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
        {section.description && (
          <div className="sm:w-3/5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </p>
          </div>
        )}
        <div className={section.description ? "sm:w-2/5" : "w-full"}>
          <ImageCarousel images={images} />
        </div>
      </div>
    </section>
  );
}
