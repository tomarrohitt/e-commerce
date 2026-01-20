export function getImageUrl(key: string | null | undefined): string {
  if (!key) return "/placeholder-avatar.png";
  if (key.startsWith("http")) return key;

  const bucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
