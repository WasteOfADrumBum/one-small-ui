import { useState } from 'react';
import { Badge, SortableList } from 'onesmallui';

interface Task {
  id: string;
  title: string;
  status: 'success' | 'warning' | 'info';
}

export default function Example() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'a', title: 'Calibrate navigation array', status: 'info' },
    { id: 'b', title: 'Refuel at Titan station', status: 'warning' },
    { id: 'c', title: 'Run diagnostics', status: 'success' },
    { id: 'd', title: 'Brief the crew', status: 'info' },
  ]);

  return (
    <SortableList
      label="Mission tasks"
      items={tasks}
      getKey={(t) => t.id}
      getItemLabel={(t) => t.title}
      onReorder={setTasks}
      renderItem={(t, { index }) => (
        <div className="os-flex os-items-center os-justify-between os-gap-3">
          <span>
            <span className="os-text-muted os-font-mono">{String(index + 1).padStart(2, '0')}</span> {t.title}
          </span>
          <Badge color={t.status} size="sm">
            {t.status}
          </Badge>
        </div>
      )}
    />
  );
}
