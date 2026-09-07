import { useState, useEffect, useRef, useCallback } from 'react';
import FullPageLoader from '../../components/common/FullPageLoader/FullPageLoader';
import Button from '../../components/common/Button/Button';
import portalService from '../../services/portal/portal.service';
import StudentDashboard from '../student/StudentDashboard';
import { useTranslation } from '../../hooks/useLocalization';
import { ShieldCheckIcon, ArrowLeftOnRectangleIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const READY_TIMEOUT_MS = 20000;

const PortalAccess = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('validating');
  const [context, setContext] = useState(null);
  const [token, setToken] = useState(null);
  const [exitLoading, setExitLoading] = useState(false);

  const handledRef = useRef(false);
  const readyTimerRef = useRef(null);
  const expireTimerRef = useRef(null);

  const receiveToken = useCallback(async (accessToken) => {
    if (handledRef.current) return;
    handledRef.current = true;
    clearInterval(readyTimerRef.current);
    clearTimeout(expireTimerRef.current);
    setToken(accessToken);

    try {
      const res = await portalService.getPortalContext(accessToken);
      setContext(res.data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!window.opener) {
      const timer = setTimeout(() => setStatus('expired'), 0);
      return () => clearTimeout(timer);
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'SMS_PORTAL_ACCESS_TOKEN') return;
      if (!event.data?.token) return;
      receiveToken(event.data.token);
    };

    window.addEventListener('message', handleMessage);

    const sendReady = () => {
      if (handledRef.current || !window.opener) return;
      window.opener.postMessage({ type: 'SMS_PORTAL_READY' }, window.location.origin);
    };

    sendReady();
    readyTimerRef.current = setInterval(sendReady, 700);
    expireTimerRef.current = setTimeout(() => {
      if (!handledRef.current) setStatus('expired');
    }, READY_TIMEOUT_MS);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(readyTimerRef.current);
      clearTimeout(expireTimerRef.current);
    };
  }, [receiveToken]);

  const closePortalTab = useCallback(() => {
    try {
      window.close();
    } catch {
      // Some browsers throw when a tab cannot close itself.
    }
  }, []);

  const handleExitPortal = async () => {
    if (exitLoading || status === 'ended') return;
    setExitLoading(true);

    try {
      // 1. End / invalidate the temporary admin-authorized portal access server-side.
      if (token) {
        await portalService.endPortalAccess(token);
      }
    } catch {
      // Even if the remote access already ended or expired, proceed with local cleanup.
    } finally {
      // 2. Clear the temporary portal access context only.
      setToken(null);
      setContext(null);

      // 3. Show the "access ended" state. This doubles as the fallback screen if
      //    the browser refuses to close the tab programmatically.
      setStatus('ended');
      setExitLoading(false);

      // 4. Close only the current Student Portal tab. The original Admin Panel
      //    tab (window.opener) is left untouched.
      closePortalTab();
    }
  };

  if (status === 'ready' && context) {
    const portalUser = {
      id: context.student.id,
      fullName: context.student.fullName,
      studentId: context.student.studentId,
    };

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheckIcon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">{t('viewingStudentPortal')}</p>
                <p className="text-xs text-indigo-100">
                  {t('accessedBy')}: {context.admin?.fullName || t('administrator')} · {t('adminAuthorizedAccess')}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleExitPortal}
              loading={exitLoading}
              className="w-auto !py-2 !px-3.5 text-xs"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1.5" />
              {t('exitPortal')}
            </Button>
          </div>
        </div>
        <StudentDashboard portalContext={{ user: portalUser, onExit: handleExitPortal }} />
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('portalAccessEndedTitle')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('portalAccessEnded')}
          </p>
          <Button variant="primary" onClick={closePortalTab}>
            {t('closePortalTab')}
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <LockClosedIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('portalAccessUnavailableTitle')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('portalAccessUnavailable')}
          </p>
          <Button variant="primary" onClick={() => window.location.replace('/admin')}>
            {t('backToAdmin')}
          </Button>
        </div>
      </div>
    );
  }

  return <FullPageLoader message={t('validatingPortalAccess')} />;
};

export default PortalAccess;