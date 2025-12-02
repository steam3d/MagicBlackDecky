import { forwardRef, PropsWithChildren, FC, MutableRefObject, useEffect, useRef } from "react";
import { useUIComposition, UIComposition } from "../uiComposition";
import { clampOpacity } from "../utils/opacity";

type ScreensaverBackgroundProps = PropsWithChildren<{
  allowTouch: boolean;
  opacity: number;
}>;

export const ScreensaverBackground = forwardRef<HTMLDivElement, ScreensaverBackgroundProps>(
  ({ allowTouch, opacity, children }, ref) => {
    useUIComposition(UIComposition.Notification);
    return (
      <div
        ref={ref}
        style={{
          height: "100vh",
          width: "100vw",
          background: "#000000",
          opacity: clampOpacity(opacity),
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 7003,
          overflow: "hidden",
          pointerEvents: allowTouch ? "none" : "auto",
        }}
      >
        {children}
      </div>
    );
  },
);

ScreensaverBackground.displayName = "ScreensaverBackground";

const DVD_COLORS = [
  "#ff9100",
  "#ff2975",
  "#00c2ff",
  "#ffd319",
  "#77ff00",
  "#f000ff",
];

const LOGO_WIDTH = 94;
const LOGO_HEIGHT = 41;

type Vector2D = { x: number; y: number };
type Dimensions = { width: number; height: number };

const defaultViewport: Dimensions = { width: 1280, height: 800 };

const getViewportSize = (element?: HTMLDivElement | null): Dimensions => {
  if (element) {
    const width = element.clientWidth || defaultViewport.width;
    const height = element.clientHeight || defaultViewport.height;
    return { width, height };
  }
  if (typeof window === "undefined") {
    return defaultViewport;
  }
  return {
    width: window.innerWidth || defaultViewport.width,
    height: window.innerHeight || defaultViewport.height,
  };
};

const getLogoSize = (element?: HTMLDivElement | null): Dimensions => {
  if (!element) {
    return { width: LOGO_WIDTH, height: LOGO_HEIGHT };
  }
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width || LOGO_WIDTH,
    height: rect.height || LOGO_HEIGHT,
  };
};

const getRandomStart = (bounds: Dimensions, logo: Dimensions): Vector2D => {
  const maxX = Math.max(bounds.width - logo.width, 0);
  const maxY = Math.max(bounds.height - logo.height, 0);
  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY,
  };
};

const updateLogoTransform = (element: HTMLDivElement | null, x: number, y: number) => {
  if (!element) {
    return;
  }
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
};

const updateLogoColor = (element: HTMLDivElement | null, color: string) => {
  if (!element) {
    return;
  }
  element.style.color = color;
  element.style.filter = `drop-shadow(0 0 32px ${color}66)`;
};

export const ScreensaverOverlay: FC<{ surfaceRef: MutableRefObject<HTMLDivElement | null> }> = ({ surfaceRef }) => {
  const animationFrameRef = useRef<number>();
  const lastTimestampRef = useRef<number>();
  const velocityRef = useRef<Vector2D>({ x: 0.12, y: 0.09 });
  const positionRef = useRef<Vector2D>(getRandomStart(defaultViewport, { width: LOGO_WIDTH, height: LOGO_HEIGHT }));
  const colorIndexRef = useRef<number>(0);
  const logoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clampPosition = (bounds: Dimensions, logo: Dimensions): Vector2D => {
      const maxX = Math.max(bounds.width - logo.width, 0);
      const maxY = Math.max(bounds.height - logo.height, 0);
      const clampedX = Math.min(Math.max(positionRef.current.x, 0), maxX);
      const clampedY = Math.min(Math.max(positionRef.current.y, 0), maxY);
      return { x: clampedX, y: clampedY };
    };

    const bounds = getViewportSize(surfaceRef.current);
    const logoSize = getLogoSize(logoRef.current);
    positionRef.current = getRandomStart(bounds, logoSize);
    colorIndexRef.current = Math.floor(Math.random() * DVD_COLORS.length);
    updateLogoColor(logoRef.current, DVD_COLORS[colorIndexRef.current]);
    const { x, y } = clampPosition(bounds, logoSize);
    positionRef.current = { x, y };
    updateLogoTransform(logoRef.current, x, y);

    const step = (timestamp: number) => {
      if (lastTimestampRef.current === undefined) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const frameBounds = getViewportSize(surfaceRef.current);
      const logoSize = getLogoSize(logoRef.current);
      const maxX = Math.max(frameBounds.width - logoSize.width, 0);
      const maxY = Math.max(frameBounds.height - logoSize.height, 0);

      let nextX = positionRef.current.x + velocityRef.current.x * delta;
      let nextY = positionRef.current.y + velocityRef.current.y * delta;
      let nextVelX = velocityRef.current.x;
      let nextVelY = velocityRef.current.y;
      let bounced = false;

      if (nextX <= 0) {
        nextX = 0;
        nextVelX = Math.abs(nextVelX);
        bounced = true;
      } else if (nextX >= maxX) {
        nextX = maxX;
        nextVelX = -Math.abs(nextVelX);
        bounced = true;
      }

      if (nextY <= 0) {
        nextY = 0;
        nextVelY = Math.abs(nextVelY);
        bounced = true;
      } else if (nextY >= maxY) {
        nextY = maxY;
        nextVelY = -Math.abs(nextVelY);
        bounced = true;
      }

      positionRef.current = { x: nextX, y: nextY };
      velocityRef.current = { x: nextVelX, y: nextVelY };
      updateLogoTransform(logoRef.current, nextX, nextY);

      if (bounced) {
        colorIndexRef.current = (colorIndexRef.current + 1) % DVD_COLORS.length;
        updateLogoColor(logoRef.current, DVD_COLORS[colorIndexRef.current]);
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = undefined;
      lastTimestampRef.current = undefined;
    };
  }, [surfaceRef]);

  return (
    <div
      ref={logoRef}
      style={{
        position: "absolute",
        width: `${LOGO_WIDTH}px`,
        height: `${LOGO_HEIGHT}px`,
        color: DVD_COLORS[0],
        filter: `drop-shadow(0 0 32px ${DVD_COLORS[0]}66)`,
        transform: "translate3d(0px, 0px, 0)",
        willChange: "transform",
        userSelect: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 188 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_57_9)" fill="currentColor">
          <path d="M129.443 10.074H147.723C147.723 10.074 169.831 8.92382 169.278 20.148C168.404 37.4701 141.492 36.2307 141.492 36.2307L146.718 13.7129H128.428L120.791 46.3047H138.94C138.94 46.3047 157.028 47.0979 171.981 40.0085C187.859 32.453 188 19.1862 188 19.1862C188.015 16.4873 187.301 13.8332 185.93 11.4977C184.559 9.1621 182.582 7.22965 180.202 5.89964C170.836 0.416445 158.646 0 158.646 0H118.671L94.9947 30.3608L85.0662 0H16.1591L13.6066 10.074H31.896C31.896 10.074 54.0143 8.92382 53.4515 20.148C52.5772 37.4701 25.6656 36.2307 25.6656 36.2307L30.9112 13.7129H12.6217L4.96429 46.3047H23.1131C23.1131 46.3047 41.2016 47.0979 56.1447 40.0085C72.0224 32.453 72.163 19.1862 72.163 19.1862C72.0751 17.3529 71.8399 15.5294 71.4596 13.7328C71.0275 12.3347 70.4547 10.0938 70.4547 10.0938H71.3491L88.1915 56.7952L129.443 10.074Z" />
          <path d="M88.7542 56.7952C39.7344 56.7952 0 62.4667 0 69.4075C0 76.3482 39.7344 82 88.7542 82C137.774 82 177.508 76.3482 177.508 69.4075C177.508 62.4667 137.774 56.7952 88.7542 56.7952ZM45.7639 76.2689H42.0256L34.2275 63.1906H39.4631L43.945 71.1229L48.447 63.1906H53.6927L45.7639 76.2689ZM66.7968 76.2689H61.9732V63.1906H66.7968V76.2689ZM83.8804 76.2689H77.0469V63.1906H83.8804C89.0557 63.1906 93.3065 66.0561 93.3065 69.7248C93.3065 73.3935 89.0155 76.2689 83.8703 76.2689H83.8804ZM113.184 66.0759H107.456V68.2573H112.892V71.1328H107.456V73.3736H113.184V76.2491H102.632V63.1906H113.184V66.0759ZM132.569 76.7052C126.609 76.7052 122.308 73.7306 122.308 69.4868C122.308 65.5207 127.222 62.7642 132.569 62.7642C137.915 62.7642 142.829 65.5306 142.829 69.4868C142.819 73.7207 138.508 76.7052 132.559 76.7052H132.569Z" />
          <path d="M132.559 66.0561C135.433 66.0561 137.794 67.7021 137.794 69.5067C137.794 71.7574 135.433 73.4034 132.559 73.4034C129.684 73.4034 127.313 71.7574 127.313 69.5067C127.313 67.7021 129.674 66.0561 132.559 66.0561Z" />
          <path d="M82.986 66.0759H81.8504V73.3736H82.9357C85.8199 73.3736 88.2819 72.2631 88.2819 69.7149C88.2819 67.4244 86.0912 66.0759 82.986 66.0759Z" />
        </g>
        <defs>
          <clipPath id="clip0_57_9">
            <rect width="188" height="82" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
