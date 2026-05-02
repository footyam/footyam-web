interface VideoEmbedProps {
  videoId: string;
}

export function VideoEmbed({ videoId }: VideoEmbedProps) {
  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <iframe
        className="aspect-video w-full"
        src={embedUrl}
        title="Highlight video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}