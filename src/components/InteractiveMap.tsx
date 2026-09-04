import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Car,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';

// Venue coordinates: Trung tâm tổ chức sự kiện - tiệc cưới Crown Palace, Thái Nguyên
const VENUE_COORDINATES = {
  lat: 21.6041,
  lng: 105.8286
};

const VENUE_INFO = {
  name: 'Trung tâm tổ chức sự kiện - tiệc cưới Crown Palace, Thái Nguyên',
  address: 'Số 779 đường Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  time: 'Từ 08:30 Sáng - Chủ Nhật, ngày 27/09/2026',
  parking: 'Bãi đỗ xe ô tô & xe máy rộng rãi ngay trong khuôn viên Crown Palace.',
  googleMapsUrl: 'https://maps.google.com/?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&ll=21.6041,105.8286&z=16',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.6041,105.8286'
};

interface InteractiveMapProps {
  className?: string;
}

function LiveMap() {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(VENUE_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full relative">
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={VENUE_COORDINATES}
        defaultZoom={16}
        gestureHandling="cooperative"
        renderingType="VECTOR"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={false}
        fullscreenControl={true}
        zoomControl={true}
        streetViewControl={true}
        mapTypeControl={true}
      >
        <AdvancedMarker
          ref={markerRef}
          position={VENUE_COORDINATES}
          title={VENUE_INFO.name}
          onClick={() => setInfoWindowOpen((prev) => !prev)}
        >
          <Pin
            background="#A3834C"
            borderColor="#5C4520"
            glyphColor="#FFFFFF"
            scale={1.2}
          />
        </AdvancedMarker>

        {infoWindowOpen && (
          <InfoWindow
            anchor={marker}
            onCloseClick={() => setInfoWindowOpen(false)}
            headerContent={
              <span className="font-serif font-bold text-xs text-brand-text">
                {VENUE_INFO.name}
              </span>
            }
          >
            <div className="p-1 space-y-2 max-w-[240px] text-left">
              <p className="text-[11px] text-brand-text-muted font-sans leading-snug">
                {VENUE_INFO.address}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-brand-border/40">
                <a
                  href={VENUE_INFO.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] uppercase font-sans font-bold bg-brand-text text-white px-2 py-1 rounded-xs hover:bg-brand-gold transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Chỉ đường</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 text-[10px] uppercase font-sans font-medium text-brand-text-muted hover:text-brand-text px-2 py-1 border border-brand-border rounded-xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}

export default function InteractiveMap({ className = '' }: InteractiveMapProps) {
  // Read Google Maps API Key from environment or manual key
  const envApiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [customKey, setCustomKey] = useState<string>(() => {
    try {
      return localStorage.getItem('user_google_maps_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  const activeApiKey = envApiKey || customKey;

  const handleCopyAddress = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(VENUE_INFO.address);
      }
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempKeyInput.trim();
    setCustomKey(clean);
    try {
      localStorage.setItem('user_google_maps_api_key', clean);
    } catch {
      // ignore
    }
    setShowKeyModal(false);
  };

  return (
    <div id="interactive-event-map" className={`space-y-3 ${className}`}>
      {/* Map Action & Venue Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-gold-light text-brand-gold rounded-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
              Bản Đồ Vị Trí Sự Kiện — Crown Palace
            </span>
            <span className="text-[10px] text-brand-text-muted block font-serif italic">
              Crown Palace Thái Nguyên • 779 Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={VENUE_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-text hover:bg-brand-text/90 text-white rounded-xs text-[10px] font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Navigation className="w-3 h-3 text-brand-gold" />
            <span>Chỉ đường</span>
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-brand-bg-alt text-brand-text border border-brand-border rounded-xs text-[10px] font-sans font-medium uppercase tracking-wider transition-colors"
            title="Sao chép địa chỉ chính xác"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          <a
            href={VENUE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-brand-text-muted hover:text-brand-gold border border-brand-border bg-white rounded-xs transition-colors"
            title="Mở toàn màn hình trên Google Maps"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative overflow-hidden rounded-sm border border-brand-border bg-[#F5F2EC] h-[280px] sm:h-[320px] shadow-xs">
        {activeApiKey ? (
          /* Live Google Maps Platform JavaScript API via @vis.gl/react-google-maps */
          <APIProvider apiKey={activeApiKey} language="vi" region="VN">
            <LiveMap />
          </APIProvider>
        ) : (
          /* Rich Interactive Preview Mode with Google Maps Embed and Quick Navigation */
          <div className="w-full h-full relative">
            <iframe
              title="Bản đồ tương tác Crown Palace Thái Nguyên"
              src="https://maps.google.com/maps?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Subtle Overlay Badge for API status */}
            <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs border border-brand-border px-2.5 py-1.5 rounded-xs shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-brand-text">
                  Chế độ Xem Trực Quan
                </p>
                <p className="text-[8px] text-brand-text-muted font-sans">
                  Sẵn sàng kết nối khóa dịch vụ bản đồ
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempKeyInput(customKey);
                  setShowKeyModal(true);
                }}
                className="ml-1 text-[9px] font-sans font-bold text-brand-gold hover:underline cursor-pointer"
              >
                Cài đặt khóa
              </button>
            </div>
          </div>
        )}

        {/* Quick Venue Badge floating at bottom left */}
        <div className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-20px)] sm:max-w-xs bg-white/95 backdrop-blur-xs border border-brand-border p-2 rounded-xs shadow-xs pointer-events-auto">
          <div className="flex items-start gap-1.5 text-left">
            <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-serif font-bold text-xs text-brand-text leading-none">
                Buffet Sen Tây Hồ
              </p>
              <p className="text-[10px] text-brand-text-muted font-sans line-clamp-1">
                {VENUE_INFO.address}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-brand-text-muted/90 pt-0.5">
                <span className="flex items-center gap-0.5">
                  <Car className="w-2.5 h-2.5 text-brand-gold" /> Bãi xe ô tô & xe máy rộng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Configuration Modal (Optional for direct in-browser testing) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white border border-brand-border rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <h4 className="font-sans font-bold uppercase text-xs tracking-wider text-brand-text">
                Cấu hình Khóa Bản Đồ (Google Maps)
              </h4>
            </div>

            <p className="text-xs text-brand-text-muted leading-relaxed font-serif italic">
              Để sử dụng tính năng bản đồ tương tác với Vector Map, Advanced Markers và tùy chỉnh điều khiển qua <strong>@vis.gl/react-google-maps</strong>, bạn có thể nhập Google Maps API Key hoặc Maps Demo Key tại đây (hoặc cấu hình biến môi trường <code>VITE_GOOGLE_MAPS_API_KEY</code>).
            </p>

            <form onSubmit={handleSaveCustomKey} className="space-y-3">
              <div>
                <label htmlFor="apiKeyInput" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                  Khóa truy cập Google Maps (API Key):
                </label>
                <input
                  type="text"
                  id="apiKeyInput"
                  placeholder="AIzaSy..."
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="text-[10px] text-brand-text-muted space-y-1 bg-[#FAF9F6] p-2.5 rounded-xs border border-brand-border/60">
                <div className="flex items-start gap-1">
                  <Info className="w-3 h-3 text-brand-gold shrink-0 mt-0.5" />
                  <p>
                    Bạn có thể lấy <strong>Maps Demo Key</strong> miễn phí để thử nghiệm từ Google Maps Platform Console.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs text-brand-text-muted hover:text-brand-text cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  Lưu & Áp Dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
