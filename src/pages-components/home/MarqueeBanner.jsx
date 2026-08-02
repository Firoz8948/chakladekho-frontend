"use client";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const marqueeItems = [
  {
    text: "Kitchen Essentials",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
  {
    text: "Chakla · Tawa · Belan",
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    text: "Daily Kitchen Tools",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3c-1.5 4-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-5-4-9z" />
        <path d="M8 21h8" />
        <path d="M10 21v-2" />
        <path d="M14 21v-2" />
      </svg>
    ),
  },
  {
    text: "Made for Indian Kitchens",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    text: "Fast Shipping",
    icon: (
      <svg {...iconProps}>
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    text: "COD Available",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    text: "7 Days Easy Return",
    icon: (
      <svg {...iconProps}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
      </svg>
    ),
  },
  {
    text: "Secure Checkout",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

const styles = `
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
    padding: 12px 0;
    background-color: #000000;
    border-top: 1px solid rgba(var(--white-rgb), 0.18);
    border-bottom: 1px solid rgba(var(--white-rgb), 0.18);
  }

  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee-scroll 30s linear infinite;
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  .marquee-group {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .marquee-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 32px;
    white-space: nowrap;
    border-right: 1px solid rgba(var(--white-rgb), 0.18);
    color: #ffffff;
  }

  .marquee-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .marquee-icon-0 { color: #F3E9DC; }
  .marquee-icon-1 { color: #ffffff; }
  .marquee-icon-2 { color: #F3E9DC; }
  .marquee-icon-3 { color: #ffffff; }
  .marquee-icon-4 { color: #F3E9DC; }
  .marquee-icon-5 { color: #ffffff; }
  .marquee-icon-6 { color: #F3E9DC; }
  .marquee-icon-7 { color: #ffffff; }

  @keyframes marquee-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .marquee-item {
      padding: 0 20px;
    }

    .marquee-track {
      animation-duration: 20s;
    }
  }
`;

export default function MarqueeBanner() {
  return (
    <>
      <style>{styles}</style>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          <div className="marquee-group">
            {marqueeItems.map((item, index) => (
              <div key={`a-${index}`} className="marquee-item">
                <span className={`marquee-icon marquee-icon-${index}`}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="marquee-group">
            {marqueeItems.map((item, index) => (
              <div key={`b-${index}`} className="marquee-item">
                <span className={`marquee-icon marquee-icon-${index}`}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
