import { useEffect } from 'react';
import { CenterPane } from './components/CenterPane';
import { LeftPane } from './components/LeftPane';
import { RightPane } from './components/RightPane';
import { SettingsModal } from './components/SettingsModal';
import { useStore } from './store';

export default function App() {
  const init = useStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-[13px] text-text">
      <LeftPane />
      <CenterPane />
      <RightPane />
      <SettingsModal />
    </div>
  );
}
