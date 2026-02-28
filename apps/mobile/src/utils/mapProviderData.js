import { colors } from '@/theme/colors';

const AVATAR_COLORS = [colors.primary.teal, colors.primary.green, colors.primary.blue];

function pickAvatarColor(id) {
  if (!id) return colors.primary.teal;
  const hash = typeof id === 'string' ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : id;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatShortName(firstName, lastName) {
  if (!firstName) return '';
  const last = lastName ? ` ${lastName.charAt(0)}.` : '';
  return `${firstName}${last}`;
}

/**
 * Map an API tasker profile to ProfessionalCard props
 */
export function mapProviderToCard(profile) {
  const firstCategory = profile.categories?.[0];

  return {
    id: profile.id,
    name: formatShortName(profile.user_first_name, profile.user_last_name),
    profession: firstCategory?.name || '',
    rating: profile.avg_rating || 0,
    reviewCount: profile.total_tasks_completed || 0,
    price: profile.hourly_rate ? `de la ${Math.round(profile.hourly_rate)} lei` : '',
    avatarColor: pickAvatarColor(profile.id),
    avatarUrl: profile.user_avatar_url,
    isRecommended: profile.avg_rating >= 4.5,
    isVerified: profile.is_verified,
  };
}

/**
 * Map an API tasker profile to provider detail screen data
 */
export function mapProviderToDetail(profile) {
  return {
    id: profile.id,
    userId: profile.user_id,
    name: profile.user_name,
    title: profile.categories?.[0]?.name || '',
    rating: profile.avg_rating || 0,
    reviewCount: profile.total_tasks_completed || 0,
    profileImage: profile.user_avatar_url,
    isVerified: profile.is_verified,
    experience: profile.experience_years ? `${profile.experience_years}+ ani experienta` : null,
    availableToday: profile.allows_instant_booking,
    about: profile.bio || '',
    responseRate: profile.response_rate,
    categories: profile.categories || [],
    hourlyRate: profile.hourly_rate,
  };
}

/**
 * Map an API review to the review card format with Romanian relative dates
 */
export function mapReview(review) {
  const now = new Date();
  const created = new Date(review.created_at);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relativeDate;
  if (diffDays === 0) relativeDate = 'azi';
  else if (diffDays === 1) relativeDate = 'ieri';
  else if (diffDays < 7) relativeDate = `acum ${diffDays} zile`;
  else if (diffDays < 14) relativeDate = 'acum 1 saptamana';
  else if (diffDays < 30) relativeDate = `acum ${Math.floor(diffDays / 7)} saptamani`;
  else if (diffDays < 60) relativeDate = 'acum 1 luna';
  else relativeDate = `acum ${Math.floor(diffDays / 30)} luni`;

  return {
    id: review.id,
    author: review.reviewer_name || 'Anonim',
    rating: review.rating,
    text: review.comment || '',
    date: relativeDate,
  };
}

/**
 * Map an API portfolio item for the gallery
 */
export function mapPortfolioItem(item) {
  const imageUrl = item.images?.[0] || null;

  return {
    id: item.id,
    image: imageUrl,
    category: item.category?.slug || 'all',
    description: item.description || item.title || '',
    service: item.title || '',
  };
}
