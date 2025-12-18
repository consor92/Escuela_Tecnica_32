import dynamic from 'next/dynamic';

const TestCalendarModal = dynamic(() => import('../Components/TestCalendarModal'), { ssr: false });

export default TestCalendarModal;
