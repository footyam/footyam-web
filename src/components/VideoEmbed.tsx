interface VideoEmbedProps {
  embedUrl: string;
}

export function VideoEmbed({ embedUrl }: VideoEmbedProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <iframe
        className="aspect-video w-full"
        src={embedUrl}
        title="Match highlights"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
