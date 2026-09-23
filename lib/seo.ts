import type { Episode, Guest, Site, Topic } from "./schemas";
import { isoDuration, youtubeWatchUrl } from "./format";

type JsonLd = Record<string, unknown>;

export function podcastSeriesJsonLd(site: Site, origin: string): JsonLd {
  const sameAs = [
    site.listen.youtube,
    site.listen.spotify,
    site.listen.apple,
    site.social.linkedin,
    site.social.instagram,
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: site.shortName,
    alternateName: site.name,
    description: site.description,
    url: origin,
    image: `${origin}/opengraph-image`,
    inLanguage: site.language,
    sameAs,
    ...(site.listen.rss ? { webFeed: site.listen.rss } : {}),
    ...(site.host.name ? { author: { "@type": "Person", name: site.host.name } } : {}),
  };
}

export function podcastEpisodeJsonLd(
  episode: Episode,
  guests: Guest[],
  site: Site,
  origin: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.sync.title,
    episodeNumber: episode.number,
    ...(episode.season
      ? { partOfSeason: { "@type": "PodcastSeason", seasonNumber: episode.season } }
      : {}),
    datePublished: episode.sync.publishedAt,
    description: episode.editorial.summary,
    url: `${origin}/episodes/${episode.slug}`,
    image: `${origin}/episodes/${episode.slug}/opengraph-image`,
    inLanguage: site.language,
    ...(episode.sync.durationSeconds
      ? { timeRequired: isoDuration(episode.sync.durationSeconds) }
      : {}),
    associatedMedia: {
      "@type": "VideoObject",
      name: episode.sync.rawTitle,
      description: episode.editorial.summary,
      thumbnailUrl: episode.sync.thumbnailUrl,
      uploadDate: episode.sync.publishedAt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${episode.sync.youtubeId}`,
      url: youtubeWatchUrl(episode.sync.youtubeId),
      ...(episode.sync.durationSeconds
        ? { duration: isoDuration(episode.sync.durationSeconds) }
        : {}),
    },
    partOfSeries: { "@type": "PodcastSeries", name: site.shortName, url: origin },
    actor: guests.map((g) => ({
      "@type": "Person",
      name: g.name,
      url: `${origin}/guests/${g.slug}`,
      ...(g.role ? { jobTitle: g.role } : {}),
    })),
  };
}

export function personJsonLd(guest: Guest, site: Site, origin: string): JsonLd {
  const sameAs = [guest.links.linkedin, guest.links.x, guest.links.website].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guest.name,
    jobTitle: guest.role,
    description: guest.bio,
    url: `${origin}/guests/${guest.slug}`,
    ...(guest.headshot ? { image: `${origin}${guest.headshot}` } : {}),
    ...(guest.company
      ? {
          worksFor: {
            "@type": "Organization",
            name: guest.company,
            ...(guest.companyUrl ? { url: guest.companyUrl } : {}),
          },
        }
      : {}),
    sameAs,
    subjectOf: { "@type": "PodcastSeries", name: site.shortName, url: origin },
  };
}

export function collectionJsonLd(
  name: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: it.url,
      })),
    },
  };
}

export function topicJsonLd(topic: Topic, origin: string, episodes: Episode[]): JsonLd {
  return collectionJsonLd(
    `${topic.name} — Leading in AI`,
    topic.description,
    `${origin}/topics/${topic.slug}`,
    episodes.map((e) => ({ name: e.sync.title, url: `${origin}/episodes/${e.slug}` })),
  );
}

export function breadcrumbJsonLd(
  origin: string,
  crumbs: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${origin}${c.path}`,
    })),
  };
}
