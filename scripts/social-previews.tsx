/**
 * Social Preview Mockups - React Components for Moodboard Demo
 * This file gets bundled into social-previews.js for the HTML moodboard
 */
import React, { useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// Inline the components to avoid import path issues in bundle

// ============ SocialPreviewFrame ============
type SocialAspectRatio = '1:1' | '4:5' | '9:16' | '16:9' | '1.91:1';
type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

const PLATFORM_THEMES = {
  facebook: {
    accent: 'text-blue-500',
    accentBg: 'bg-blue-500',
    gradient: 'from-blue-600 to-blue-400',
    ring: 'ring-blue-500',
    label: 'bg-blue-600',
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  instagram: {
    accent: 'text-pink-500',
    accentBg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
    gradient: 'from-purple-600 via-pink-500 to-yellow-400',
    ring: 'ring-pink-500',
    label: 'bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400',
    glowColor: 'rgba(236, 72, 153, 0.2)',
  },
  tiktok: {
    accent: 'text-cyan-400',
    accentBg: 'bg-black',
    gradient: 'from-cyan-400 to-pink-500',
    ring: 'ring-cyan-400',
    label: 'bg-black',
    glowColor: 'rgba(34, 211, 238, 0.2)',
  },
} as const;

const ASPECT_CLASSES: Record<SocialAspectRatio, string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-video',
  '1.91:1': 'aspect-[1.91/1]',
};

interface SocialPreviewFrameProps {
  platform: SocialPlatform;
  aspectRatio: SocialAspectRatio;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string;
}

function SocialPreviewFrame({
  platform,
  aspectRatio,
  children,
  header,
  footer,
  selected,
  onClick,
  className = '',
  label,
}: SocialPreviewFrameProps) {
  const theme = PLATFORM_THEMES[platform];
  const aspectClass = ASPECT_CLASSES[aspectRatio];
  const isVertical = aspectRatio === '9:16';

  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  });

  const maxTilt = 12;
  const shadowIntensity = 20;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = ((centerY - y) / centerY) * maxTilt;

    const shadowX = -rotateY * (shadowIntensity / maxTilt);
    const shadowY = rotateX * (shadowIntensity / maxTilt);

    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      boxShadow: `${shadowX}px ${shadowY}px 40px ${theme.glowColor}, 0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
    });
  }, [theme.glowColor]);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    });
  }, []);

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          social-preview-frame relative rounded-2xl border border-white/10 overflow-hidden
          bg-[rgba(255,255,255,0.03)] backdrop-blur-[16px] backdrop-saturate-150
          transition-all duration-150 ease-out transform-gpu
          ${isVertical ? 'w-[220px]' : 'w-full max-w-md'}
          ${selected ? `ring-2 ring-offset-2 ring-offset-[#121218] ${theme.ring}` : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        style={{
          ...tiltStyle,
          transformStyle: 'preserve-3d',
        }}
      >
        {label && (
          <div className={`absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-xs font-medium text-white ${theme.label}`}>
            {label}
          </div>
        )}
        {header && (
          <div className="px-3 py-2 border-b border-white/5">
            {header}
          </div>
        )}
        <div className="relative">
          <div className={`relative w-full ${aspectClass} bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden`}>
            {!children && (
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
        {footer && (
          <div className="px-3 py-2 border-t border-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ FacebookPostMockup ============
interface FacebookPostMockupProps {
  profileName?: string;
  profileImage?: string;
  timestamp?: string;
  caption?: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

// Facebook Post SVG Icons (authentic style)
const FbGlobeIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm5.6 5.6h-1.9c-.2-.9-.5-1.7-.9-2.5 1.2.5 2.1 1.4 2.8 2.5zM8 1.4c.6.9 1.1 1.9 1.4 3h-2.8c.3-1.1.8-2.1 1.4-3zm-5.1 6c-.1-.4-.1-.9-.1-1.4s0-1 .1-1.4h2.2c0 .5-.1.9-.1 1.4s0 1 .1 1.4H2.9zm.5 1.4h1.9c.2.9.5 1.7.9 2.5-1.2-.5-2.1-1.4-2.8-2.5zM5.3 5.6H3.4c.7-1.1 1.6-2 2.8-2.5-.4.8-.7 1.6-.9 2.5zM8 14.6c-.6-.9-1.1-1.9-1.4-3h2.8c-.3 1.1-.8 2.1-1.4 3zm1.7-4.4H6.3c-.1-.5-.1-.9-.1-1.4s0-1 .1-1.4h3.4c.1.4.1.9.1 1.4s0 1-.1 1.4zm.2 3.2c.4-.8.7-1.6.9-2.5h1.9c-.7 1.1-1.6 2-2.8 2.5zm1.2-3.8c.1-.5.1-.9.1-1.4s0-1-.1-1.4h2.2c.1.4.1.9.1 1.4s0 1-.1 1.4h-2.2z"/>
  </svg>
);

const FbMoreIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <circle cx="4" cy="10" r="1.5"/>
    <circle cx="10" cy="10" r="1.5"/>
    <circle cx="16" cy="10" r="1.5"/>
  </svg>
);

const FbLikeIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 0 1 1.789 2.894l-3.5 7A2 2 0 0 1 15.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5"/>
  </svg>
);

const FbCommentIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);

const FbShareIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684z"/>
  </svg>
);

// Mini reaction icons for the reactions bar
const FbThumbsUpMini = () => (
  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.3 2.7c-.15-.4-.55-.6-.95-.45-.4.15-.6.55-.45.95l.9 2.4H6.5c-.55 0-1 .45-1 1v.3c0 .25.1.5.3.7l3.2 3.2v2.2c0 .55.45 1 1 1s1-.45 1-1v-2.5c0-.25-.1-.5-.3-.7L8 7.6h2.8c.4 0 .8-.25.9-.6l.6-1.6c.1-.4-.1-.85-.5-.95l-1.5-.75z"/>
  </svg>
);

const FbHeartMini = () => (
  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 14l-.9-.82C3.6 9.9 1.5 7.9 1.5 5.5 1.5 3.6 3 2.1 4.8 2.1c1 0 2 .5 2.6 1.3.6-.8 1.6-1.3 2.6-1.3 1.8 0 3.3 1.5 3.3 3.4 0 2.4-2.1 4.4-5.6 7.7L8 14z"/>
  </svg>
);

function FacebookPostMockup({
  profileName = 'Your Page',
  timestamp = 'Just now',
  caption,
  imageUrl,
  likes = 0,
  comments = 0,
  shares = 0,
}: FacebookPostMockupProps) {
  const initials = profileName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const header = (
    <div className="flex items-center gap-2.5">
      {/* Profile picture with blue gradient */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
        {initials}
      </div>
      {/* Name, timestamp, globe icon */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white leading-tight hover:underline cursor-pointer">{profileName}</p>
        <div className="flex items-center gap-1 text-[13px] text-white/50">
          <span>{timestamp}</span>
          <span className="mx-0.5">·</span>
          <FbGlobeIcon />
        </div>
      </div>
      {/* 3-dot menu */}
      <button className="p-1.5 rounded-full hover:bg-white/10 text-white/60 transition-colors">
        <FbMoreIcon />
      </button>
    </div>
  );

  const footer = (
    <div className="space-y-2">
      {/* Reactions row */}
      <div className="flex items-center justify-between text-[13px] text-white/60">
        {/* Overlapping reaction emojis + count */}
        <div className="flex items-center gap-1.5">
          {likes > 0 && (
            <>
              <div className="flex -space-x-1">
                {/* Like (thumbs up) - blue circle */}
                <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center ring-2 ring-[#242526] z-30">
                  <FbThumbsUpMini />
                </span>
                {/* Love (heart) - red/pink circle */}
                <span className="w-[18px] h-[18px] rounded-full bg-[#f33e58] flex items-center justify-center ring-2 ring-[#242526] z-20">
                  <FbHeartMini />
                </span>
                {/* Haha - yellow circle */}
                <span className="w-[18px] h-[18px] rounded-full bg-[#f7b928] flex items-center justify-center ring-2 ring-[#242526] z-10 text-[10px]">
                  😆
                </span>
              </div>
              <span className="hover:underline cursor-pointer">{formatCount(likes)}</span>
            </>
          )}
        </div>
        {/* Comments & shares count */}
        <div className="flex items-center gap-2">
          {comments > 0 && <span className="hover:underline cursor-pointer">{formatCount(comments)} comments</span>}
          {comments > 0 && shares > 0 && <span className="text-white/30">·</span>}
          {shares > 0 && <span className="hover:underline cursor-pointer">{formatCount(shares)} shares</span>}
        </div>
      </div>
      {/* Divider */}
      <div className="h-px bg-white/10" />
      {/* Action buttons */}
      <div className="flex items-center justify-around -mx-1">
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-white/10 text-white/70 text-[14px] font-medium transition-colors">
          <FbLikeIcon />
          <span>Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-white/10 text-white/70 text-[14px] font-medium transition-colors">
          <FbCommentIcon />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-white/10 text-white/70 text-[14px] font-medium transition-colors">
          <FbShareIcon />
          <span>Share</span>
        </button>
      </div>
    </div>
  );

  return (
    <SocialPreviewFrame platform="facebook" aspectRatio="1:1" header={header} footer={footer}>
      {/* Caption area above image */}
      {caption && (
        <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-[#242526]/95 backdrop-blur-sm z-10">
          <p className="text-[15px] text-white leading-snug line-clamp-2">{caption}</p>
        </div>
      )}
      {/* Image/media area */}
      {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
    </SocialPreviewFrame>
  );
}

// ============ InstagramFeedMockup ============
interface InstagramFeedMockupProps {
  profileName?: string;
  profileImage?: string;
  caption?: string;
  imageUrl?: string;
  likes?: number;
  likedBy?: string;
  comments?: number;
  timestamp?: string;
  verified?: boolean;
}

function InstagramFeedMockup({
  profileName = 'youraccount',
  profileImage,
  caption,
  imageUrl,
  likes = 0,
  likedBy,
  comments = 0,
  timestamp = '2h',
  verified = false,
}: InstagramFeedMockupProps) {
  const initials = profileName.slice(0, 2).toUpperCase();
  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  // Instagram-style SVG icons (outlined)
  const HeartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );

  const BookmarkIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );

  const VerifiedBadge = () => (
    <svg className="w-3.5 h-3.5 text-[#0095f6]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
    </svg>
  );

  const MoreIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );

  const header = (
    <div className="flex items-center gap-3 py-1">
      {/* Story ring gradient around profile pic */}
      <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
        <div className="w-full h-full rounded-full bg-black p-[2px]">
          {profileImage ? (
            <img src={profileImage} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-[10px] font-semibold">
              {initials}
            </div>
          )}
        </div>
      </div>
      {/* Username + verified badge */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-sm font-semibold text-white">{profileName}</span>
        {verified && <VerifiedBadge />}
      </div>
      {/* 3-dot menu */}
      <button className="text-white/80 hover:text-white">
        <MoreIcon />
      </button>
    </div>
  );

  const footer = (
    <div className="space-y-2 pt-1">
      {/* Action row: Heart, Comment, Share | Bookmark */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white">
          <button className="hover:text-white/70 transition-colors">
            <HeartIcon />
          </button>
          <button className="hover:text-white/70 transition-colors">
            <CommentIcon />
          </button>
          <button className="hover:text-white/70 transition-colors -rotate-45 -translate-y-0.5">
            <ShareIcon />
          </button>
        </div>
        <button className="text-white hover:text-white/70 transition-colors">
          <BookmarkIcon />
        </button>
      </div>

      {/* Likes */}
      {likes > 0 && (
        <p className="text-sm font-semibold text-white">
          {likedBy ? (
            <>Liked by <span className="font-semibold">{likedBy}</span> and <span className="font-semibold">{formatCount(likes - 1)} others</span></>
          ) : (
            <>{formatCount(likes)} likes</>
          )}
        </p>
      )}

      {/* Caption: Username bold + text */}
      {caption && (
        <p className="text-sm text-white/90 leading-tight">
          <span className="font-semibold text-white">{profileName}</span>{' '}
          <span className="text-white/80">{caption}</span>
        </p>
      )}

      {/* View all comments link */}
      {comments > 0 && (
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          View all {formatCount(comments)} comments
        </button>
      )}

      {/* Timestamp */}
      <p className="text-[11px] text-white/40 uppercase tracking-wide">{timestamp}</p>
    </div>
  );

  return (
    <SocialPreviewFrame platform="instagram" aspectRatio="4:5" header={header} footer={footer} >
      {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
    </SocialPreviewFrame>
  );
}

// ============ InstagramReelMockup ============
interface InstagramReelMockupProps {
  profileName?: string;
  profileImage?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  isFollowing?: boolean;
  songName?: string;
  artistName?: string;
  albumArt?: string;
}

function InstagramReelMockup({
  profileName = 'youraccount',
  profileImage,
  caption,
  likes = 0,
  comments = 0,
  shares = 0,
  isFollowing = false,
  songName = 'Original Audio',
  artistName,
  albumArt,
}: InstagramReelMockupProps) {
  const initials = profileName.slice(0, 2).toUpperCase();
  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Truncate caption for "...more" display
  const maxCaptionLength = 50;
  const displayCaption = caption && caption.length > maxCaptionLength
    ? caption.slice(0, maxCaptionLength).trim() + '...'
    : caption;
  const showMore = caption && caption.length > maxCaptionLength;

  // Instagram Reel SVG icons
  const HeartIcon = () => (
    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
      <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938z"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
    </svg>
  );

  const ShareIcon = () => (
    <svg className="w-7 h-7 -rotate-12" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
    </svg>
  );

  const MoreIcon = () => (
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2"/>
      <circle cx="12" cy="12" r="2"/>
      <circle cx="12" cy="19" r="2"/>
    </svg>
  );

  const MusicNoteIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg className={className} fill="white" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );

  return (
    <SocialPreviewFrame platform="instagram" aspectRatio="9:16" >
      {/* CSS for spinning disc animation and marquee */}
      <style>{`
        @keyframes ig-spin-disc {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ig-spinning-disc {
          animation: ig-spin-disc 3s linear infinite;
        }
        @keyframes ig-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ig-marquee-text {
          animation: ig-marquee 8s linear infinite;
        }
      `}</style>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Right sidebar - bottom aligned */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-10">
        {/* Heart/Like */}
        <div className="flex flex-col items-center gap-1">
          <HeartIcon />
          <span className="text-white text-[11px] font-semibold">{formatCount(likes)}</span>
        </div>

        {/* Comment bubble */}
        <div className="flex flex-col items-center gap-1">
          <CommentIcon />
          <span className="text-white text-[11px] font-semibold">{formatCount(comments)}</span>
        </div>

        {/* Share arrow */}
        <div className="flex flex-col items-center gap-1">
          <ShareIcon />
          {shares > 0 && <span className="text-white text-[11px] font-semibold">{formatCount(shares)}</span>}
        </div>

        {/* 3-dot menu */}
        <MoreIcon />

        {/* Spinning music disc with album art */}
        <div className="relative w-8 h-8 mt-1">
          <div className="ig-spinning-disc w-full h-full rounded-md border-[2px] border-white/80 overflow-hidden">
            {albumArt ? (
              <img src={albumArt} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/90" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left overlay - Profile info */}
      <div className="absolute left-3 right-14 bottom-11 z-10">
        {/* Profile row with gradient ring */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="w-full h-full rounded-full bg-black p-[1px] overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-[9px] text-white font-bold">
                  {initials}
                </div>
              )}
            </div>
          </div>
          <span className="text-[13px] font-semibold text-white">{profileName}</span>
          {!isFollowing && (
            <button className="px-2.5 py-0.5 text-[11px] font-semibold text-white bg-transparent border border-white/80 rounded-md hover:bg-white/10 transition-colors">
              Follow
            </button>
          )}
        </div>

        {/* Caption with "...more" */}
        {caption && (
          <p className="text-[11px] text-white leading-relaxed">
            {displayCaption}
            {showMore && <span className="text-white/60 ml-1">more</span>}
          </p>
        )}
      </div>

      {/* Audio/Music info bar with marquee */}
      <div className="absolute left-3 right-14 bottom-3 z-10 flex items-center gap-2 overflow-hidden">
        <MusicNoteIcon className="w-3 h-3 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <span className="ig-marquee-text inline-block text-[11px] text-white whitespace-nowrap">
            {artistName ? `${artistName} \u00B7 ${songName}` : songName}
            <span className="mx-6">{artistName ? `${artistName} \u00B7 ${songName}` : songName}</span>
          </span>
        </div>
      </div>

      {/* Thin white progress bar - very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/30">
        <div className="h-full w-1/3 bg-white" />
      </div>
    </SocialPreviewFrame>
  );
}

// ============ FacebookReelMockup ============
interface FacebookReelMockupProps {
  profileName?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  songName?: string;
}

function FacebookReelMockup({
  profileName = 'Your Page',
  caption,
  likes = 0,
  comments = 0,
  shares = 0,
  songName = 'Original audio',
}: FacebookReelMockupProps) {
  const initials = profileName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  // Facebook Reel SVG icons
  const HeartIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
    </svg>
  );

  const ShareIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-5 5m5-5l5 5"/>
    </svg>
  );

  const MusicNoteIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );

  return (
    <SocialPreviewFrame platform="facebook" aspectRatio="9:16" >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Right sidebar - Facebook style with rounded buttons */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 z-10 text-white">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <HeartIcon />
          </div>
          <span className="text-[11px] font-medium">{formatCount(likes)}</span>
        </div>
        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <CommentIcon />
          </div>
          <span className="text-[11px] font-medium">{formatCount(comments)}</span>
        </div>
        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <ShareIcon />
          </div>
          <span className="text-[11px] font-medium">{formatCount(shares)}</span>
        </div>
        {/* Spinning music disc */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-white/20 flex items-center justify-center animate-[spin_3s_linear_infinite]">
          <div className="w-3 h-3 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Bottom overlay - Profile info */}
      <div className="absolute left-3 right-14 bottom-12 z-10">
        <div className="flex items-center gap-2 mb-2">
          {/* Profile pic with blue gradient */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
            {initials}
          </div>
          <span className="text-sm font-bold text-white drop-shadow-lg">{profileName}</span>
          {/* Follow button - blue bg, more rounded */}
          <button className="px-3 py-1 text-[11px] font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            Follow
          </button>
        </div>
        {caption && <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow-md">{caption}</p>}
      </div>

      {/* Audio bar at bottom */}
      <div className="absolute left-0 right-0 bottom-0 z-10 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-white">
            <MusicNoteIcon />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] text-white/90 truncate">{songName}</p>
          </div>
        </div>
      </div>
    </SocialPreviewFrame>
  );
}

// ============ InstagramStoryMockup ============
interface InstagramStoryMockupProps {
  profileName?: string;
  profileImage?: string;
  timestamp?: string;
  storyCount?: number;
  currentStory?: number;
}

function InstagramStoryMockup({
  profileName = 'youraccount',
  profileImage,
  timestamp = '2h',
  storyCount = 3,
  currentStory = 1,
}: InstagramStoryMockupProps) {
  const initials = profileName.slice(0, 2).toUpperCase();

  return (
    <SocialPreviewFrame platform="instagram" aspectRatio="9:16" >
      {/* Top gradient overlay for progress bars and header visibility */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none z-[5]" />
      {/* Bottom gradient overlay for message input visibility */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none z-[5]" />

      {/* Story Progress Bars - segmented for multiple stories */}
      <div className="absolute top-2 left-2 right-2 flex gap-[3px] z-20">
        {Array.from({ length: storyCount }).map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full bg-white/30 overflow-hidden">
            {i < currentStory ? (
              // Viewed stories - fully filled
              <div className="w-full h-full bg-white" />
            ) : i === currentStory ? (
              // Current story - partial fill with animation effect
              <div className="w-[60%] h-full bg-white rounded-full" />
            ) : null}
          </div>
        ))}
      </div>

      {/* Header - Profile pic with gradient ring, username, timestamp, close button */}
      <div className="absolute top-5 left-2 right-2 flex items-center z-20">
        {/* Profile picture with Instagram gradient ring */}
        <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-[#1a1a1a] p-[1px]">
            {profileImage ? (
              <img src={profileImage} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[9px] text-white font-semibold">
                {initials}
              </div>
            )}
          </div>
        </div>
        {/* Username and timestamp */}
        <div className="flex items-center gap-2 ml-2 flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-white truncate">{profileName}</span>
          <span className="text-[10px] text-white/60 flex-shrink-0">{timestamp}</span>
        </div>
        {/* More options (three dots) */}
        <button className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white flex-shrink-0 ml-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
        {/* Close button (X) */}
        <button className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bottom Actions - Message input with gradient border, heart, share */}
      <div className="absolute bottom-3 left-2 right-2 flex items-center gap-3 z-20">
        {/* Message input pill with gradient border */}
        <div className="flex-1 relative rounded-full p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400">
          <div className="w-full px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
            <span className="text-[11px] text-white/70">Send message</span>
          </div>
        </div>
        {/* Heart reaction icon */}
        <button className="flex-shrink-0 text-white hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Paper airplane share icon */}
        <button className="flex-shrink-0 text-white hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </SocialPreviewFrame>
  );
}

// ============ TikTokMockup ============
interface TikTokMockupProps {
  profileName?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  bookmarks?: number;
  shares?: number;
  songName?: string;
  isFollowing?: boolean;
}

function TikTokMockup({
  profileName = 'creator',
  caption,
  likes = 0,
  comments = 0,
  bookmarks = 0,
  shares = 0,
  songName = 'Original Sound',
  isFollowing = false,
}: TikTokMockupProps) {
  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // TikTok icons
  const HeartIcon = () => (
    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  );

  const BookmarkIcon = () => (
    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  );

  const ShareIcon = () => (
    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" transform="rotate(90 12 12)"/>
    </svg>
  );

  const MusicIcon = () => (
    <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );

  return (
    <SocialPreviewFrame platform="tiktok" aspectRatio="9:16">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-[1]" />

      {/* Right sidebar */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Profile with follow button */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white">
            {profileName.slice(0, 1).toUpperCase()}
          </div>
          {!isFollowing && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#fe2c55] flex items-center justify-center text-white text-xs font-bold">
              +
            </div>
          )}
        </div>

        {/* Like */}
        <div className="flex flex-col items-center">
          <HeartIcon />
          <span className="text-xs text-white font-semibold mt-1">{formatCount(likes)}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <CommentIcon />
          <span className="text-xs text-white font-semibold mt-1">{formatCount(comments)}</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <BookmarkIcon />
          <span className="text-xs text-white font-semibold mt-1">{formatCount(bookmarks)}</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <ShareIcon />
          <span className="text-xs text-white font-semibold mt-1">{formatCount(shares)}</span>
        </div>

        {/* Spinning music disc */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border-2 border-zinc-600 flex items-center justify-center animate-[spin_3s_linear_infinite]">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute left-3 right-16 bottom-4 z-10">
        {/* Username */}
        <p className="text-white font-bold text-sm mb-1">@{profileName}</p>

        {/* Caption */}
        {caption && (
          <p className="text-white text-xs mb-2 line-clamp-2">{caption}</p>
        )}

        {/* Music info */}
        <div className="flex items-center gap-2">
          <MusicIcon />
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-xs whitespace-nowrap animate-[marquee_8s_linear_infinite]">
              {songName} · {songName}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
        <div className="h-full w-2/5 bg-white rounded-full" />
      </div>
    </SocialPreviewFrame>
  );
}

// ============ Demo App ============
function SocialPreviewsDemo() {
  return (
    <div className="mt-6 space-y-8">
      <p className="text-zinc-400 text-sm">
        Realistic mockup containers for previewing content across social platforms.
        Each mockup shows platform-specific chrome/UI with glassmorphism styling.
      </p>

      <div className="flex flex-wrap gap-8 justify-center">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Facebook Post (1:1)</h3>
          <FacebookPostMockup
            profileName="Creator Studio"
            caption="Check out our latest content!"
            likes={1247}
            comments={48}
            shares={12}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Instagram Post (4:5)</h3>
          <InstagramFeedMockup
            profileName="creator.toolkit"
            caption="Amazing content coming your way! #creator #toolkit"
            likes={2847}
            likedBy="design.studio"
            comments={48}
            timestamp="2 hours ago"
            verified={true}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Instagram Reel (9:16)</h3>
          <InstagramReelMockup
            profileName="creator.toolkit"
            caption="This reel is going viral! Check out these amazing tips for content creators..."
            likes={12400}
            comments={248}
            shares={89}
            songName="Trendy Sound"
            artistName="Top Creator"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Facebook Reel (9:16)</h3>
          <FacebookReelMockup
            profileName="Creator Studio"
            caption="Watch till the end!"
            likes={5200}
            comments={89}
            shares={24}
            songName="Trending Sound - Creator Mix"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Instagram Story (9:16)</h3>
          <InstagramStoryMockup
            profileName="creator.toolkit"
            timestamp="2h"
            storyCount={3}
            currentStory={1}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">TikTok (9:16)</h3>
          <TikTokMockup
            profileName="creator.toolkit"
            caption="POV: When your content finally goes viral #fyp #viral #creator"
            likes={245600}
            comments={1820}
            bookmarks={8940}
            shares={4200}
            songName="Trending Sound - Viral Mix"
          />
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-cyan-400 mb-2">React Usage</h3>
        <pre className="text-xs text-zinc-400 overflow-x-auto"><code>{`import { SocialPreviewCard, FacebookPostMockup } from '@/components/SocialHub';

// Dynamic format switching
<SocialPreviewCard format="instagram-reel" caption="Check this out!" />

// Direct component usage
<FacebookPostMockup profileName="My Page" likes={1200} />`}</code></pre>
      </div>
    </div>
  );
}

// Mount the app
const container = document.getElementById('social-previews-root');
if (container) {
  const root = createRoot(container);
  root.render(<SocialPreviewsDemo />);
}
