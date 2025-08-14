import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Settings, ExternalLink, Users, Clock } from 'lucide-react';

// Google Calendar API configuration - Environment variables'dan yüklenir
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const Calendar: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Initialize Google API
  React.useEffect(() => {
    // Check if API credentials are configured
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      setApiError('Google Calendar API anahtarları yapılandırılmamış. Lütfen geçerli API anahtarları ekleyin.');
      return;
    }

    const initializeGoogleAPI = async () => {
      try {
        // Load Google API script
        if (!window.gapi) {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => initializeGapi();
          document.head.appendChild(script);
        } else {
          initializeGapi();
        }

        // Load Google Identity Services
        if (!window.google) {
          const gisScript = document.createElement('script');
          gisScript.src = 'https://accounts.google.com/gsi/client';
          gisScript.onload = () => initializeGis();
          document.head.appendChild(gisScript);
        } else {
          initializeGis();
        }
      } catch (error) {
        console.error('Google API yükleme hatası:', error);
        setApiError('Google API yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
      }
    };

    const initializeGapi = async () => {
      try {
        // Check if API key is provided and not empty
        if (!GOOGLE_API_KEY || GOOGLE_API_KEY.trim() === '') {
          setApiError('Google API anahtarı yapılandırılmamış. Lütfen .env.local dosyasında VITE_GOOGLE_API_KEY değerini ayarlayın.');
          return;
        }

        await new Promise<void>((resolve) => {
          window.gapi.load('client', resolve);
        });

        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        setGapiLoaded(true);
        setApiError('');
      } catch (error) {
        console.error('GAPI initialization error:', error);
        
        // Handle specific API key errors
        if (error && typeof error === 'object' && 'error' in error) {
          const apiError = error as any;
          if (apiError.error?.code === 400 && apiError.error?.message?.includes('API key not valid')) {
            setApiError('Google API anahtarı geçersiz. Lütfen .env.local dosyasındaki VITE_GOOGLE_API_KEY değerini kontrol edin ve Google Cloud Console\'da API\'nin etkin olduğundan emin olun.');
          } else {
            setApiError(`Google Calendar API hatası: ${apiError.error?.message || 'Bilinmeyen hata'}`);
          }
        } else {
          setApiError('Google Calendar API başlatılamadı. API anahtarları ve internet bağlantınızı kontrol edin.');
        }
      }
    };

    const initializeGis = () => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse.error !== undefined) {
              setApiError('Google ile giriş başarısız: ' + tokenResponse.error);
              return;
            }
            setIsSignedIn(true);
            loadCalendarEvents();
          },
        });
        setTokenClient(client);
        setGisLoaded(true);
      } catch (error) {
        console.error('GIS initialization error:', error);
        setApiError('Google Identity Services başlatılamadı.');
      }
    };

    initializeGoogleAPI();
  }, []);

  const loadCalendarEvents = async () => {
    if (!window.gapi.client.calendar) {
      setApiError('Calendar API yüklenmedi.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });

      const events = response.result.items || [];
      setEvents(events);
      setApiError('');
    } catch (error) {
      console.error('Takvim etkinlikleri yüklenirken hata:', error);
      setApiError('Takvim etkinlikleri yüklenemedi. İzinleri kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!gapiLoaded || !gisLoaded) {
      setApiError('Google API henüz yüklenmedi. Lütfen birkaç saniye bekleyin.');
      return;
    }

    // Use redirect-based authentication to avoid popup blockers
    handleGoogleSignInRedirect();
  };

  const handleGoogleSignInRedirect = () => {
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `include_granted_scopes=true&` +
      `state=google_auth`;
    
    window.location.href = redirectUrl;
  };

  // Handle redirect callback
  React.useEffect(() => {
    const handleAuthCallback = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') && hash.includes('state=google_auth')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken && window.gapi?.client) {
          window.gapi.client.setToken({ access_token: accessToken });
          setIsSignedIn(true);
          loadCalendarEvents();
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    if (gapiLoaded) {
      handleAuthCallback();
    }
  }, [gapiLoaded]);

  const handleSignOut = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
    setIsSignedIn(false);
    setEvents([]);
  };

  const createEvent = async () => {
    if (!isSignedIn) {
      alert('Önce Google hesabınızla giriş yapın.');
      return;
    }

    const eventTitle = prompt('Etkinlik başlığı:');
    if (!eventTitle) return;

    const eventDate = prompt('Tarih (YYYY-MM-DD):');
    if (!eventDate) return;

    const eventTime = prompt('Saat (HH:MM):');
    if (!eventTime) return;

    try {
      const startDateTime = new Date(`${eventDate}T${eventTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const event = {
        summary: eventTitle,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      alert('Etkinlik başarıyla oluşturuldu!');
      loadCalendarEvents(); // Refresh events
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error);
      alert('Etkinlik oluşturulamadı. Hata: ' + error);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'presentation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock calendar events for demonstration when not signed in
  const mockEvents = [
    {
      id: '1',
      summary: 'Takım Toplantısı',
      start: { dateTime: '2025-01-15T10:00:00' },
      attendees: [{ email: 'admin@example.com' }, { email: 'team@example.com' }],
      type: 'meeting'
    },
    {
      id: '2',
      summary: 'Proje Teslim Tarihi',
      start: { dateTime: '2025-01-20T18:00:00' },
      attendees: [{ email: 'team@example.com' }],
      type: 'deadline'
    },
    {
      id: '3',
      summary: 'Müşteri Sunumu',
      start: { dateTime: '2025-01-25T14:00:00' },
      attendees: [{ email: 'admin@example.com' }, { email: 'client@example.com' }],
      type: 'presentation'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">Takvim</h1>
            <p className="text-sm text-gray-600">Programınızı ve etkinliklerinizi yönetin</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!isSignedIn ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={!gapiLoaded || !gisLoaded}
                className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1 text-xs ${
                  gapiLoaded && gisLoaded
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ExternalLink className="h-2.5 w-2.5" />
                {gapiLoaded && gisLoaded ? 'Google Takvim Bağla' : 'Yükleniyor...'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={createEvent}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-medium flex items-center gap-1 text-xs"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Etkinlik Oluştur
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-medium text-xs"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Embed Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {/* API Status Message */}
              {apiError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-xs">{apiError}</p>
                  {apiError.includes('popup') && (
                    <div className="mt-2 text-yellow-700 text-xs">
                      <p><strong>Popup engelleyici sorunu çözümü:</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Tarayıcınızın adres çubuğunda popup engelleme simgesini arayın</li>
                        <li>Bu site için popup'lara izin verin</li>
                        <li>Sayfayı yenileyin ve tekrar deneyin</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {!isSignedIn ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Google Takviminizi Bağlayın</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto text-xs">
                    Google hesabınızla giriş yaparak takvim etkinliklerinizi doğrudan uygulama içinde görüntüleyin ve yönetin.
                  </p>
                  <div className="mb-4">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={!gapiLoaded || !gisLoaded}
                      className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-1.5 mx-auto text-xs ${
                        gapiLoaded && gisLoaded
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {gapiLoaded && gisLoaded ? 'Google ile Giriş Yap' : 'API Yükleniyor...'}
                    </button>
                    
                    {apiError.includes('Popup engellendiği') && (
                      <button
                        onClick={handleGoogleSignInRedirect}
                        className="mt-2 px-4 py-2 rounded font-medium transition-colors flex items-center gap-1.5 mx-auto text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Google ile Giriş Yap (Yönlendirme)
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-xs">Neler yapabilirsiniz:</h4>
                    <ul className="text-left text-gray-600 space-y-1.5 text-xs">
                      <li className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Google Takvim etkinliklerinizi görüntüleyin
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Doğrudan uygulamadan yeni etkinlikler oluşturun
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Takım takvimleriyle senkronize olun
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Yaklaşan etkinlikler için bildirimler alın
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900">Google Takviminiz</h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Bağlandı
                      </span>
                      <button
                        onClick={loadCalendarEvents}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs"
                      >
                        Yenile
                      </button>
                    </div>
                  </div>
                  
                  {/* Google Calendar Events */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    {isLoading ? (
                      <div className="text-center">
                        <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-600 text-xs">Etkinlikler yükleniyor...</p>
                      </div>
                    ) : events.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm mb-3">Yaklaşan Etkinlikleriniz ({events.length})</h4>
                        {events.slice(0, 10).map((event, index) => (
                          <div key={event.id || index} className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{event.summary || 'Başlıksız Etkinlik'}</p>
                                <p className="text-gray-600 text-xs mt-1">
                                  {event.start?.dateTime ? 
                                    new Date(event.start.dateTime).toLocaleString('tr-TR', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    event.start?.date ? 
                                    new Date(event.start.date).toLocaleDateString('tr-TR', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }) : 
                                    'Tarih belirtilmemiş'
                                  }
                                </p>
                                {event.attendees && event.attendees.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {event.attendees.length} katılımcı
                                    </span>
                                  </div>
                                )}
                              </div>
                              {event.htmlLink && (
                                <a
                                  href={event.htmlLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 ml-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center">
                        <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-xs">Yaklaşan etkinlik bulunamadı.</p>
                        <button
                          onClick={createEvent}
                          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs"
                        >
                          İlk Etkinliğinizi Oluşturun
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-blue-600" />
                Yaklaşan Etkinlikler
              </h3>
              
              <div className="space-y-2">
                {(isSignedIn && events.length > 0 ? events.slice(0, 3) : mockEvents).map((event, index) => (
                  <div key={event.id || index} className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-0.5">
                      <h4 className="font-medium text-gray-900 text-xs">{event.summary || event.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getEventTypeColor(event.type || 'meeting')}`}>
                        {event.type === 'deadline' ? 'teslim' : event.type === 'presentation' ? 'sunum' : 'toplantı'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      {event.start?.dateTime ? 
                        new Date(event.start.dateTime).toLocaleDateString('tr-TR', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Tarih belirtilmemiş'
                      }
                    </p>
                    <div className="flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {event.attendees ? 
                          `${event.attendees.length} katılımcı` : 
                          'Katılımcı yok'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Hızlı İşlemler</h3>
              
              <div className="space-y-1.5">
                <button
                  onClick={createEvent}
                  disabled={!isSignedIn}
                  className={`w-full py-1.5 px-2.5 rounded font-medium transition-colors flex items-center gap-1 text-xs ${
                    isSignedIn
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="h-2.5 w-2.5" />
                  {isSignedIn ? 'Toplantı Planla' : 'Önce Giriş Yapın'}
                </button>
                <button 
                  onClick={() => window.open('https://calendar.google.com', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2.5 rounded font-medium transition-colors flex items-center gap-1 text-xs"
                >
                  <CalendarIcon className="h-2.5 w-2.5" />
                  Tam Takvimi Görüntüle
                </button>
                <button 
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/settings', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2.5 rounded font-medium transition-colors flex items-center gap-1 text-xs"
                >
                  <Settings className="h-2.5 w-2.5" />
                  Takvim Ayarları
                </button>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Entegrasyon Durumu</h3>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700 text-xs">Google Takvim</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSignedIn 
                      ? 'bg-green-100 text-green-800' 
                      : gapiLoaded && gisLoaded
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isSignedIn ? 'Bağlı' : gapiLoaded && gisLoaded ? 'Hazır' : 'Yükleniyor'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700 text-xs">API Durumu</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    gapiLoaded && gisLoaded && !apiError
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {gapiLoaded && gisLoaded && !apiError ? 'Aktif' : 'Hata'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;