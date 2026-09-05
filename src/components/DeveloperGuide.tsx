import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data';
import { 
  BookOpen, 
  Copy, 
  Check, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  HelpCircle, 
  HardDrive, 
  ShieldCheck, 
  Globe, 
  Server, 
  ExternalLink, 
  QrCode, 
  Download, 
  FileSpreadsheet, 
  Zap, 
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import ReceptionCheckin from './ReceptionCheckin';
import { RsvpData } from '../types';

interface DeveloperGuideProps {
  appsScriptUrl?: string;
  currentUrl?: string;
  onSaveUrl: (url: string) => void;
  onReset?: () => void;
  onResetUrl?: () => void;
  rsvpList?: RsvpData[];
  onToggleCheckIn?: (attendeeId: string, currentStatus: boolean) => void;
  onOpenPass?: (attendee?: RsvpData) => void;
}

export default function DeveloperGuide({ 
  appsScriptUrl = '', 
  currentUrl = '',
  onSaveUrl, 
  onReset,
  onResetUrl,
  rsvpList = [],
  onToggleCheckIn = () => {},
  onOpenPass = () => {}
}: DeveloperGuideProps) {
  const effectiveUrl = (appsScriptUrl || currentUrl || '').trim();
  const [inputUrl, setInputUrl] = useState(effectiveUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'reception' | 'database' | 'hosting' | 'test' | 'code' | 'faq' | 'overview'>('reception');
  
  // Update local input if parent prop changes
  React.useEffect(() => {
    setInputUrl(effectiveUrl);
  }, [effectiveUrl]);

  const handleResetAction = () => {
    if (onReset) onReset();
    if (onResetUrl) onResetUrl();
  };

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    sampleDataCount?: number;
  } | null>(null);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      handleResetAction();
      setSaveStatus('Đã chuyển về Chế độ Giả lập (Offline Demo Mode).');
      return;
    }

    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      setSaveStatus('Cảnh báo: Đường dẫn phải bắt đầu bằng https://script.google.com/macros/s/...');
      return;
    }

    if (!cleanUrl.endsWith('/exec')) {
      setSaveStatus('Lưu ý: Đường dẫn Web App của Google Apps Script cần kết thúc bằng /exec (không phải /edit hay /dev).');
    }

    onSaveUrl(cleanUrl);
    setSaveStatus('Đã lưu cấu hình kết nối thành công! ❤️');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Test live connection to Google Apps Script
  const handleTestConnection = async () => {
    const targetUrl = inputUrl.trim() || effectiveUrl;
    if (!targetUrl) {
      setTestResult({
        success: false,
        message: 'Chưa nhập URL Google Apps Script để kiểm tra!',
        details: 'Vui lòng dán đường dẫn Web App (kết thúc bằng /exec) vào ô cấu hình trước khi kiểm tra.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Send query to test doGet endpoint with action=get_all_data
      const response = await fetch(`${targetUrl}?action=get_all_data&timestamp=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Máy chủ Google phản hồi mã lỗi HTTP: ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      if (data && data.status === 'success') {
        const rsvpCount = data.data?.rsvp?.length ?? (Array.isArray(data.rsvp) ? data.rsvp.length : 0);
        const wishesCount = data.data?.wishes?.length ?? 0;
        setTestResult({
          success: true,
          message: 'Kết nối Google Apps Script & Google Sheets hoàn toàn thành công!',
          details: `Đã kết nối với Sheet thành công. Tìm thấy ${rsvpCount} bản ghi điểm danh và ${wishesCount} lời chúc.`,
          sampleDataCount: rsvpCount
        });
        onSaveUrl(targetUrl);
      } else if (data && (Array.isArray(data) || Array.isArray(data.attendees))) {
        const count = Array.isArray(data) ? data.length : (data.attendees?.length || 0);
        setTestResult({
          success: true,
          message: 'Kết nối Google Apps Script thành công!',
          details: `Đã đọc dữ liệu thành công từ Google Sheets. Hiện có ${count} bản ghi điểm danh.`,
          sampleDataCount: count
        });
        onSaveUrl(targetUrl);
      } else {
        setTestResult({
          success: true,
          message: 'Đã nhận phản hồi từ Web App, nhưng cấu trúc dữ liệu trả về chưa khớp hoàn toàn.',
          details: 'Hãy đảm bảo bạn đã copy toàn bộ mã nguồn file Code.gs mới nhất và triển khai phiên bản mới.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Không thể kết nối đến Web App!',
        details: err.message || 'Lỗi thường gặp: Bạn chưa chọn quyền "Anyone" (Bất kỳ ai) khi Deploy, hoặc URL bị thiếu chữ /exec.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="developer-guide-card" className="bg-[#fcfaf7] border border-brand-border rounded-sm p-5 md:p-8 shadow-xs space-y-7 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-gold-light text-brand-gold rounded-sm shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-brand-gold block">
              TÀI LIỆU KỸ THUẬT & HƯỚNG DẪN TRIỂN KHAI TOÀN DIỆN
            </span>
            <h3 className="text-xl md:text-2xl font-serif text-brand-text font-bold">
              Cẩm Nang Vận Hành & Triển Khai Lớp K8A1
            </h3>
            <p className="text-xs text-brand-text-muted font-serif italic">
              Hướng dẫn chi tiết từ A-Z cách đưa website lên mạng và kết nối lưu trữ miễn phí với Google Sheets & Google Drive
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {appsScriptUrl ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-sans font-bold rounded-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang kết nối Google Sheets thật</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-sans font-bold rounded-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Đang chạy Offline Demo</span>
            </span>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-brand-border/60 scrollbar-none text-xs font-sans font-bold">
        <button
          onClick={() => setActiveSubTab('reception')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'reception'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bàn Lễ Tân Check-in (27/09)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'database'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-brand-gold" />
          <span>1. Cài Đặt Google Sheets (Database)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hosting')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'hosting'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-brand-gold" />
          <span>2. Đưa Website Lên Mạng (Hosting)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('test')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'test'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-brand-gold" />
          <span>3. Kiểm Tra Kết Nối (Ping Test)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('code')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'code'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-brand-gold" />
          <span>4. Mã Nguồn Code.gs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faq')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'faq'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
          <span>5. Bảng Sửa Lỗi Thường Gặp (FAQs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-2 rounded-t-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
            activeSubTab === 'overview'
              ? 'border-brand-gold text-brand-text bg-white'
              : 'border-transparent text-brand-text-muted hover:text-brand-text hover:bg-white/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-brand-gold" />
          <span>Sơ Đồ Kiến Trúc Hệ Thống</span>
        </button>
      </div>

      {/* API URL CONFIGURATION BOX (Always visible for quick access) */}
      <form onSubmit={handleSave} className="bg-white p-5 sm:p-6 rounded-sm border border-brand-border space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2 text-brand-gold">
            <Key className="w-4 h-4" />
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-text">
              Điểm Kết Nối Dữ Liệu (Google Apps Script Web App URL)
            </h4>
          </div>
          <span className="text-[10px] text-brand-text-muted font-mono">Endpoint: /exec</span>
        </div>

        <p className="text-xs text-brand-text-muted leading-relaxed font-serif italic">
          Sau khi tạo và Deploy ứng dụng web từ Google Sheets theo các bước bên dưới, hãy <strong>dán liên kết Web App (có đuôi <code>/exec</code>)</strong> vào ô này và nhấn "Lưu cấu hình". Dữ liệu đăng ký tham dự, lời chúc và điểm danh sẽ lập tức đổ về Google Sheet của bạn!
        </p>

        <div className="space-y-2">
          <label htmlFor="scriptUrl" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
            Đường dẫn Google Apps Script Web App:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              id="scriptUrl"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-3.5 py-2.5 border border-brand-border rounded-sm bg-[#FAF9F6] text-brand-text font-mono text-xs focus:outline-none focus:border-brand-gold"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-brand-text hover:bg-brand-gold text-white font-sans font-bold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                Lưu cấu hình
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-brand-gold-light hover:bg-brand-gold hover:text-white text-brand-text font-sans font-bold text-[10px] uppercase tracking-wider py-2.5 px-3.5 rounded-sm transition-colors border border-brand-border cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kiểm tra kết nối</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3 bg-brand-gold-light/60 border border-brand-gold/30 text-xs text-brand-text rounded-sm font-serif italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-sm border text-xs space-y-1 ${
            testResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2 font-bold font-sans">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{testResult.message}</span>
            </div>
            {testResult.details && (
              <p className="font-serif italic text-[11px] pl-6">{testResult.details}</p>
            )}
          </div>
        )}
      </form>

      {/* TAB CONTENT: RECEPTION DESK CHECK-IN */}
      {activeSubTab === 'reception' && (
        <div className="bg-white p-6 rounded-sm border border-brand-border shadow-xs">
          <ReceptionCheckin 
            attendees={rsvpList}
            onToggleCheckIn={onToggleCheckIn}
            onOpenPass={onOpenPass}
          />
        </div>
      )}

      {/* TAB CONTENT: 1. GOOGLE SHEETS & DRIVE (DATABASE SETUP) */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
              HƯỚNG DẪN CHI TIẾT TỪNG BƯỚC CHO NGƯỜI KHÔNG CHUYÊN IT
            </span>
            <h4 className="text-xl font-serif font-bold text-brand-text">
              Thiết Lập Cơ Sở Dữ Liệu Miễn Phí (Google Sheets + Google Drive)
            </h4>
            <p className="text-xs text-brand-text-muted font-serif italic">
              Google Sheets đóng vai trò là cơ sở dữ liệu lưu danh sách đăng ký tham dự, điểm danh và sổ lưu bút. Google Drive dùng để lưu hình ảnh bạn bè tải lên. Hoàn toàn miễn phí, an toàn và bạn làm chủ 100% dữ liệu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">1</span>
                <span className="font-sans uppercase tracking-wider text-xs">Tạo Google Sheet Mới</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Truy cập <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-brand-gold font-bold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> để tạo bảng tính mới. Đặt tên file là: <code>Hội Ngộ 20 Năm Lớp K8A1</code>.
              </p>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-brand-border/60 text-[11px] text-brand-text font-sans">
                💡 <strong>Mẹo hay:</strong> Bạn không cần gõ tiêu đề cột thủ công! Script thông minh sẽ tự động tạo dòng tiêu đề chuẩn và tự động sinh thêm Sheet mang tên <code>Loi_Chuc</code>, <code>Luot_Truy_Cap</code> khi có lượt gửi đầu tiên.
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">2</span>
                <span className="font-sans uppercase tracking-wider text-xs">Mở Trình Soạn Thảo Apps Script</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Trên menu thanh công cụ của Google Sheets, chọn:
              </p>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-brand-border/60 text-[11px] font-mono text-brand-text">
                Tiện ích mở rộng (Extensions) → Apps Script
              </div>
              <p className="text-[11px] text-brand-text-muted italic">
                Trình duyệt sẽ mở một tab mới hiển thị trình soạn mã nguồn của Google.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">3</span>
                <span className="font-sans uppercase tracking-wider text-xs">Tạo Thư Mục Lưu Ảnh Trên Google Drive</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Truy cập <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold font-bold underline inline-flex items-center gap-0.5">drive.google.com <ExternalLink className="w-3 h-3" /></a>, tạo thư mục đặt tên <code>Anh_Ky_Niem_K8A1</code>.
              </p>
              <div className="space-y-1.5 p-2.5 bg-amber-50/60 rounded border border-amber-200/60 text-[11px] text-brand-text font-sans">
                <p><strong>Cực kỳ quan trọng:</strong> Chuột phải vào thư mục vừa tạo → Chọn <strong>Chia sẻ (Share)</strong> → Đổi quyền truy cập chung thành: <strong>Bất kỳ ai có đường liên kết (Anyone with the link) có quyền Xem</strong>.</p>
                <p className="text-brand-text-muted font-mono text-[10px]">
                  Sao chép chuỗi ID trên thanh địa chỉ: drive.google.com/drive/folders/<strong>[ĐÂY_LÀ_ID_THƯ_MỤC]</strong>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">4</span>
                <span className="font-sans uppercase tracking-wider text-xs">Dán Mã Code.gs & Điền ID Thư Mục</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Xóa toàn bộ mã mặc định trong file <code>Code.gs</code> của Apps Script. Sao chép mã ở Tab <strong>"4. Mã Nguồn Code.gs"</strong> rồi dán vào.
              </p>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-brand-border/60 text-[11px] text-brand-text font-sans space-y-1">
                <p>Tìm dòng số 10 trong mã nguồn:</p>
                <code className="block bg-slate-900 text-amber-300 p-2 rounded text-[10px] font-mono">
                  DRIVE_FOLDER_ID: "MÃ_ID_THƯ_MỤC_Ở_BƯỚC_3",
                </code>
                <p className="text-[10px] text-brand-text-muted">Nhấn phím <strong>Ctrl + S</strong> (hoặc Command + S trên Mac) để lưu lại.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">5</span>
                <span className="font-sans uppercase tracking-wider text-xs">Triển Khai Mới (New Deployment)</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Tại góc trên bên phải của màn hình Apps Script, nhấp vào nút màu xanh:
              </p>
              <div className="p-2.5 bg-[#FAF8F5] rounded border border-brand-border/60 text-[11px] font-sans text-brand-text space-y-1">
                <p>1. Nhấn nút <strong>Triển khai (Deploy)</strong> → Chọn <strong>Tùy chọn triển khai mới (New deployment)</strong>.</p>
                <p>2. Nhấn vào biểu tượng <strong>Bánh răng ⚙️ (Chọn loại)</strong> → Chọn <strong>Ứng dụng web (Web app)</strong>.</p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold text-brand-text">
                <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">6</span>
                <span className="font-sans uppercase tracking-wider text-xs">Cấu Hình Quyền Truy Cập (Quyết Định!)</span>
              </div>
              <p className="text-brand-text-muted leading-relaxed font-serif italic">
                Điền chính xác 2 thông số sau để bạn bè không bị hỏi mật khẩu:
              </p>
              <div className="p-2.5 bg-rose-50/70 border border-rose-200/70 rounded text-[11px] font-sans text-brand-text space-y-1.5">
                <p>• <strong>Thực thi dưới tên (Execute as):</strong> <code>Tôi (Email cá nhân của bạn)</code></p>
                <p>• <strong>Ai có quyền truy cập (Who has access):</strong> <strong className="text-rose-700">Bất kỳ ai (Anyone)</strong></p>
                <p className="text-[10px] text-brand-text-muted italic">⚠️ Nếu bạn chọn "Chỉ mình tôi" thì các bạn trong lớp khi mở form sẽ gặp lỗi 403 Forbidden!</p>
              </div>
            </div>
          </div>

          {/* Step 7 & Safety Warning Explanation */}
          <div className="bg-white p-5 rounded-sm border border-brand-border space-y-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 font-bold text-brand-text">
              <span className="w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center font-sans text-xs">7</span>
              <span className="font-sans uppercase tracking-wider text-xs">Cấp Quyền Ứng Dụng (Khi Google Hiện Cảnh Báo "Chưa Xác Minh")</span>
            </div>
            <p className="text-brand-text-muted leading-relaxed font-serif italic">
              Khi bạn nhấn Deploy lần đầu tiên, Google sẽ yêu cầu "Ủy quyền truy cập" (Authorize access). Vì đây là ứng dụng nội bộ do chính bạn viết trong tài khoản Google của bạn, Google sẽ hiển thị màn hình cảnh báo an toàn. Bạn chỉ cần làm như sau:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#FAF8F5] rounded border border-brand-border/60 space-y-1">
                <span className="font-bold text-brand-text block">1. Nhấn Nâng Cao</span>
                <p className="text-[11px] text-brand-text-muted">Tại màn hình cảnh báo "Google chưa xác minh ứng dụng này", nhấn vào dòng chữ <strong>Nâng cao (Advanced)</strong> ở góc dưới.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded border border-brand-border/60 space-y-1">
                <span className="font-bold text-brand-text block">2. Đi Tới Dự Án</span>
                <p className="text-[11px] text-brand-text-muted">Nhấp vào dòng chữ <strong>Đi tới Dự án (không an toàn)</strong> / <em>Go to Project (unsafe)</em>.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded border border-brand-border/60 space-y-1">
                <span className="font-bold text-brand-text block">3. Bấm Cho Phép</span>
                <p className="text-[11px] text-brand-text-muted">Nhấn nút <strong>Cho phép (Allow)</strong> để cấp quyền cho script đọc ghi vào Sheet và Drive của bạn.</p>
              </div>
            </div>
          </div>

          {/* Final Step */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-bold font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bước Cuối Cùng: Sao Chép URL Web App</span>
            </div>
            <p className="font-serif italic text-[11px]">
              Sau khi Deploy thành công, Google sẽ cung cấp cho bạn một đường link có dạng: <br />
              <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 select-all">
                https://script.google.com/macros/s/AKfycbx.../exec
              </code><br />
              Hãy copy link này, dán vào ô <strong>"Đường dẫn Google Apps Script Web App"</strong> ở phía trên cùng trang này và bấm <strong>Lưu cấu hình</strong>. Ngay lập tức trang web đã kết nối với cơ sở dữ liệu thật của bạn!
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. HOSTING (BRING WEBSITE ONLINE) */}
      {activeSubTab === 'hosting' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
              ĐƯA TRANG WEB LÊN INTERNET CHO CẢ LỚP TRUY CẬP
            </span>
            <h4 className="text-xl font-serif font-bold text-brand-text">
              Các Phương Án Triển Khai Hosting Website (Miễn Phí Vĩnh Viễn)
            </h4>
            <p className="text-xs text-brand-text-muted font-serif italic">
              Bạn có thể xuất bản website lên internet để chia sẻ đường link vào nhóm Zalo lớp qua 3 cách đơn giản sau:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: AI Studio Direct Deploy */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-3 text-xs shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold font-sans text-[10px] rounded uppercase tracking-wider">
                  ⚡ Nhanh Nhất (30 Giây)
                </div>
                <h5 className="font-serif font-bold text-base text-brand-text">
                  Cách 1: Nút Share / Deploy Trên AI Studio
                </h5>
                <p className="text-brand-text-muted font-serif italic leading-relaxed">
                  Ngay tại thanh công cụ trên cùng của Google AI Studio Build, bạn chỉ cần nhấn vào nút <strong>Share</strong> hoặc <strong>Deploy to Cloud Run</strong>.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-sans text-[11px] text-brand-text">
                  <li>Hệ thống tự động biên dịch và tạo đường dẫn công khai (Public URL).</li>
                  <li>Bạn có thể sao chép link gửi ngay vào nhóm chat Zalo của lớp.</li>
                  <li>Hoàn toàn tự động, không cần cài đặt thêm phần mềm gì.</li>
                </ul>
              </div>
            </div>

            {/* Option 2: Vercel Free Hosting */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-3 text-xs shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold font-sans text-[10px] rounded uppercase tracking-wider">
                  🌟 Đẹp Nhất (Tên Miền Riêng)
                </div>
                <h5 className="font-serif font-bold text-base text-brand-text">
                  Cách 2: Triển Khai Lên Vercel (Miễn Phí)
                </h5>
                <p className="text-brand-text-muted font-serif italic leading-relaxed">
                  Vercel là dịch vụ lưu trữ web miễn phí tốc độ cao nhất hiện nay:
                </p>
                <ol className="list-decimal pl-4 space-y-1 font-sans text-[11px] text-brand-text">
                  <li>Tải mã nguồn về dạng ZIP hoặc đẩy lên GitHub.</li>
                  <li>Truy cập <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold font-bold underline">vercel.com</a> → Đăng nhập bằng GitHub.</li>
                  <li>Chọn <strong>Add New Project</strong> → Import repo.</li>
                  <li>Framework Preset: <strong>Vite</strong>.</li>
                  <li>Build Command: <code>npm run build</code>.</li>
                  <li>Output Directory: <code>dist</code>.</li>
                  <li>Nhấn <strong>Deploy</strong>. Trong 1 phút bạn sẽ có link dạng <code>k8a1-thainguyen.vercel.app</code>.</li>
                </ol>
              </div>
            </div>

            {/* Option 3: Netlify / Cloudflare Pages */}
            <div className="bg-white p-5 rounded-sm border border-brand-border space-y-3 text-xs shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold font-sans text-[10px] rounded uppercase tracking-wider">
                  📂 Kéo Thả Tiện Lợi
                </div>
                <h5 className="font-serif font-bold text-base text-brand-text">
                  Cách 3: Kéo Thả Lên Netlify Drop
                </h5>
                <p className="text-brand-text-muted font-serif italic leading-relaxed">
                  Dành cho người thích kéo thả trực tiếp không cần tài khoản GitHub:
                </p>
                <ol className="list-decimal pl-4 space-y-1 font-sans text-[11px] text-brand-text">
                  <li>Chạy lệnh <code>npm run build</code> trên máy để tạo thư mục <code>dist/</code>.</li>
                  <li>Mở <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-brand-gold font-bold underline">netlify.com/drop</a>.</li>
                  <li>Kéo thả nguyên thư mục <code>dist</code> vào trình duyệt.</li>
                  <li>Netlify sẽ xuất bản ngay lập tức một đường link công khai cho bạn!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* QR Code and Sharing advice */}
          <div className="bg-[#FAF8F5] border border-brand-border rounded-sm p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-brand-gold font-sans font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Kinh Nghiệm Vận Hành Ngày Hội Khóa 27/09/2026</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-serif italic text-brand-text">
              <div className="space-y-1">
                <p className="font-bold font-sans not-italic text-brand-text">📱 Tạo mã QR in để ở cổng Crown Palace:</p>
                <p>Sau khi có đường link website, hãy tạo mã QR miễn phí tại <a href="https://www.qr-code-generator.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold underline font-bold">qr-code-generator.com</a>. In mã QR này đặt tại bàn Lễ Tân để bạn bè quét điện thoại xem thẻ học sinh (Pass) và ảnh kỷ niệm.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold font-sans not-italic text-brand-text">📊 Xuất file Excel trước ngày diễn ra:</p>
                <p>Dữ liệu được lưu trực tiếp trên Google Sheets. Bạn chỉ cần mở Google Sheet → Chọn <strong>Tệp (File) → Tải xuống → Microsoft Excel (.xlsx)</strong> để in danh sách cho bộ phận phát áo đồng phục và đối soát tiệc mừng.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. PING TEST & HEALTH CHECK */}
      {activeSubTab === 'test' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
              CHẨN ĐOÁN KẾT NỐI TỰ ĐỘNG
            </span>
            <h4 className="text-xl font-serif font-bold text-brand-text">
              Kiểm Tra Hoạt Động Của Google Apps Script
            </h4>
            <p className="text-xs text-brand-text-muted font-serif italic">
              Công cụ này sẽ gửi một lệnh ping thử nghiệm tới URL Google Apps Script bạn đã cấu hình để kiểm tra quyền truy cập và kiểm tra xem bảng tính Google Sheets có phản hồi hay không.
            </p>
          </div>

          <div className="bg-white p-6 rounded-sm border border-brand-border space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
              <div>
                <p className="font-bold text-sm text-brand-text">Đường dẫn hiện tại được kiểm tra:</p>
                <code className="text-xs font-mono text-brand-gold break-all">
                  {inputUrl || appsScriptUrl || '(Chưa có URL)'}
                </code>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-brand-text hover:bg-brand-gold text-white font-sans font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-sm transition-colors shadow-xs cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi thử nghiệm...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-brand-gold" />
                    <span>Chạy Kiểm Tra Ngay</span>
                  </>
                )}
              </button>
            </div>

            {testResult ? (
              <div className={`p-5 rounded-sm border space-y-2 text-xs ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold font-sans text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.details && (
                  <p className="font-serif italic pl-7 text-xs">{testResult.details}</p>
                )}
                {testResult.success && testResult.sampleDataCount !== undefined && (
                  <div className="pl-7 pt-2 font-sans text-[11px] text-emerald-800">
                    ✅ Kết nối đã sẵn sàng phục vụ cho ngày hội ngộ 20 năm của Lớp K8A1!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#FAF8F5] border border-brand-border/60 rounded text-xs text-brand-text-muted font-serif italic text-center">
                Nhấn nút "Chạy Kiểm Tra Ngay" ở trên để kiểm tra tình trạng kết nối tới cơ sở dữ liệu của bạn.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. FULL SCRIPT CODE (CODE.GS) */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
                MÃ NGUỒN ĐÃ ĐƯỢC TỐI ƯU SẴN SÀNG
              </span>
              <h4 className="text-xl font-serif font-bold text-brand-text">
                Mã Nguồn Google Apps Script (Code.gs)
              </h4>
              <p className="text-xs text-brand-text-muted font-serif italic">
                Bao gồm API tiếp nhận đăng ký tham dự, Sổ lưu bút, Tải ảnh lên Google Drive và Đếm số lượt truy cập.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyScript}
              className="flex items-center gap-2 text-xs uppercase font-sans tracking-wider text-white bg-brand-text hover:bg-brand-gold font-bold px-4 py-2.5 rounded-sm shadow-xs cursor-pointer shrink-0 transition-colors"
            >
              {copiedScript ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Đã sao chép vào bộ nhớ tạm!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-brand-gold" />
                  <span>Sao Chép Toàn Bộ Mã</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-brand-text font-serif italic">
            <strong>Thông báo:</strong> Mã ID thư mục Google Drive của bạn (<code>1Skmip1HQhmXan-58kwbY_msamP-bWokq</code>) đã được tích hợp sẵn vào mã nguồn bên dưới! Bạn chỉ cần copy và dán trực tiếp vào Google Apps Script.
          </div>

          <div className="overflow-hidden rounded-sm border border-brand-border bg-slate-900 shadow-lg max-h-[450px] overflow-y-auto">
            <pre className="p-4 text-[11px] font-mono text-slate-100 leading-relaxed overflow-x-auto select-all">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. FAQS & TROUBLESHOOTING */}
      {activeSubTab === 'faq' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
              HỎI ĐÁP & XỬ LÝ SỰ CỐ KỸ THUẬT
            </span>
            <h4 className="text-xl font-serif font-bold text-brand-text">
              Các Lỗi Thường Gặp & Cách Khắc Phục Nhanh
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* FAQ 1 */}
            <div className="bg-white p-4 rounded-sm border border-brand-border space-y-1.5 shadow-2xs">
              <h5 className="font-bold text-brand-text font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>1. Lỗi: "Access denied" hoặc khi bạn bè mở form thì bị yêu cầu đăng nhập tài khoản Google?</span>
              </h5>
              <p className="text-brand-text-muted font-serif italic leading-relaxed pl-6">
                <strong>Nguyên nhân:</strong> Khi Deploy Web App, bạn đã để mục <em>"Ai có quyền truy cập (Who has access)"</em> là "Chỉ mình tôi" (Only myself) hoặc chỉ trong tổ chức. <br />
                <strong>Cách sửa:</strong> Trong Apps Script, nhấn <strong>Deploy → Manage deployments (Quản lý triển khai)</strong> → Nhấn biểu tượng <strong>Cây bút ✏️ (Chỉnh sửa)</strong> → Đổi mục "Who has access" thành <strong>"Anyone" (Bất kỳ ai)</strong> → Chọn Version mới → Nhấn <strong>Deploy</strong>.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white p-4 rounded-sm border border-brand-border space-y-1.5 shadow-2xs">
              <h5 className="font-bold text-brand-text font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. Lỗi: Dán link nhưng không nhận hoặc báo lỗi CORS / Network Error?</span>
              </h5>
              <p className="text-brand-text-muted font-serif italic leading-relaxed pl-6">
                <strong>Nguyên nhân:</strong> Bạn đã sao chép nhầm đường dẫn trang chỉnh sửa (kết thúc bằng <code>/edit</code>) hoặc link thử nghiệm (kết thúc bằng <code>/dev</code>). <br />
                <strong>Cách sửa:</strong> Đường dẫn chính xác bắt buộc phải kết thúc bằng <code>/exec</code>, ví dụ: <code>https://script.google.com/macros/s/AKfycb.../exec</code>.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white p-4 rounded-sm border border-brand-border space-y-1.5 shadow-2xs">
              <h5 className="font-bold text-brand-text font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>3. Ảnh tải lên Google Drive không hiển thị trên trang web?</span>
              </h5>
              <p className="text-brand-text-muted font-serif italic leading-relaxed pl-6">
                <strong>Nguyên nhân:</strong> Thư mục Google Drive chưa được bật quyền chia sẻ công khai. <br />
                <strong>Cách sửa:</strong> Mở Google Drive → Chuột phải vào thư mục ảnh → <strong>Chia sẻ</strong> → Đổi quyền truy cập thành: <strong>"Bất kỳ ai có đường liên kết có quyền Xem"</strong>.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white p-4 rounded-sm border border-brand-border space-y-1.5 shadow-2xs">
              <h5 className="font-bold text-brand-text font-sans flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4. Có cần tạo trước các cột trong Google Sheets không?</span>
              </h5>
              <p className="text-brand-text-muted font-serif italic leading-relaxed pl-6">
                <strong>Không cần!</strong> Mã nguồn Apps Script đã được lập trình để tự động kiểm tra: nếu Sheet còn trống, script sẽ tự động tạo dòng tiêu đề gồm <code>Mã Đăng Ký, Họ và Tên, Số Điện Thoại, Lớp / Tổ, Cỡ Áo, Tham Dự, Lời Nhắn, Thời Gian Gửi, Điểm Danh</code>. Đồng thời tự động tạo thêm tab <code>Loi_Chuc</code> và <code>Luot_Truy_Cap</code> một cách hoàn toàn tự động.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SYSTEM ARCHITECTURE */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold">
              TỔNG QUAN HỆ THỐNG (SYSTEM ARCHITECTURE)
            </span>
            <h4 className="text-xl font-serif font-bold text-brand-text">
              Mô Hình Vận Hành Không Máy Chủ (Serverless 100% Free)
            </h4>
          </div>

          <div className="bg-white p-5 rounded-sm border border-brand-border space-y-4 text-xs shadow-2xs font-serif italic">
            <p className="text-brand-text leading-relaxed">
              Hệ thống được thiết kế theo kiến trúc <strong>Serverless Không Cần Duy Trì Máy Chủ</strong>, tận dụng tối đa hạ tầng đám mây miễn phí và bền vững của Google:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans not-italic text-[11px] pt-2">
              <div className="p-3 bg-[#FAF8F5] border border-brand-border rounded">
                <p className="font-bold text-brand-gold uppercase text-[10px]">1. Giao Diện (Frontend)</p>
                <p className="text-brand-text mt-1">React 18 + Vite + Tailwind CSS. Triển khai miễn phí trên Cloud Run, Vercel hoặc Netlify.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-brand-border rounded">
                <p className="font-bold text-brand-gold uppercase text-[10px]">2. Cổng API (Middleware)</p>
                <p className="text-brand-text mt-1">Google Apps Script Web App. Tiếp nhận request POST/GET qua HTTPS an toàn.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-brand-border rounded">
                <p className="font-bold text-brand-gold uppercase text-[10px]">3. Lưu Trữ (Database & Storage)</p>
                <p className="text-brand-text mt-1">Google Sheets lưu văn bản / danh sách. Google Drive lưu hình ảnh kỷ niệm.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

