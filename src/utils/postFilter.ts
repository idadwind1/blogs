import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

const postFilter = ({ data }: CollectionEntry<"blog">) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  const isDevUnpublishedBypass = import.meta.env.DEV && import.meta.env.ALLOW_UNPUBLISHED === "true";
  return !data.draft && (isDevUnpublishedBypass || isPublishTimePassed);
};

export default postFilter;
