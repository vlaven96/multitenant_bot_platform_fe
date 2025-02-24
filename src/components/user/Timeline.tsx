import React, { useState, useEffect, useRef } from 'react';
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  MarkSeries,
  Hint,
  Highlight
} from 'react-vis';
import 'react-vis/dist/style.css';
import './Timeline.css';

interface AccountExecution {
  type: string;
  start_time: string;
}

interface StatusChange {
  new_status: string;
  changed_at: string;
}

interface SnapchatAccountTimelineStatistics {
  creation_date: string;
  ingestion_date: string;
  account_executions: AccountExecution[];
  status_changes: StatusChange[];
}

interface TimelineEvent {
  x: number;
  y: number;
  type: 'creation' | 'ingestion' | 'status' | 'execution';
  title: string;
  date: string;
}

interface TimelineProps {
  timelineStats: SnapchatAccountTimelineStatistics;
}

const Timeline: React.FC<TimelineProps> = ({ timelineStats }) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimelineEvent | null>(null);
  const [lastDrawLocation, setLastDrawLocation] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 40);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getEventColor = (type: 'creation' | 'ingestion' | 'status' | 'execution') => {
    switch (type) {
      case 'creation':
        return '#28a745';
      case 'ingestion':
        return '#17a2b8';
      case 'status':
        return '#ffc107';
      case 'execution':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  const getYCoordinate = (type: 'creation' | 'ingestion' | 'status' | 'execution') => {
    switch (type) {
      case 'creation':
        return 4;
      case 'ingestion':
        return 3;
      case 'status':
        return 2;
      case 'execution':
        return 1;
      default:
        return 0;
    }
  };

  const renderTooltipContent = (event: TimelineEvent) => {
    const baseContent = (
      <>
        <h4>{event.title}</h4>
        <p className="mb-0">
          <strong>Time:</strong> {formatDate(event.date)}
        </p>
      </>
    );

    switch (event.type) {
      case 'creation':
        return (
          <div className="timeline-tooltip">
            {baseContent}
            <p className="mb-0"><strong>Event:</strong> Account Creation</p>
          </div>
        );
      case 'ingestion':
        return (
          <div className="timeline-tooltip">
            {baseContent}
            <p className="mb-0"><strong>Event:</strong> Added to System</p>
          </div>
        );
      case 'status':
        return (
          <div className="timeline-tooltip">
            {baseContent}
            <p className="mb-0">
              <strong>Event:</strong> Status Change
            </p>
            <p className="mb-0">
              <strong>New Status:</strong> {event.title.split(': ')[1]}
            </p>
          </div>
        );
      case 'execution':
        const operationType = event.title.split(': ')[1];
        return (
          <div className="timeline-tooltip">
            {baseContent}
            <p className="mb-0">
              <strong>Event:</strong> Account Execution
            </p>
            <p className="mb-0">
              <strong>Operation:</strong> {operationType}
            </p>
          </div>
        );
      default:
        return (
          <div className="timeline-tooltip">
            {baseContent}
          </div>
        );
    }
  };

  const allEvents: TimelineEvent[] = [
    {
      x: new Date(timelineStats.creation_date).getTime(),
      y: getYCoordinate('creation'),
      type: 'creation' as const,
      title: 'Account Created',
      date: timelineStats.creation_date
    },
    {
      x: new Date(timelineStats.ingestion_date).getTime(),
      y: getYCoordinate('ingestion'),
      type: 'ingestion' as const,
      title: 'Account Added to System',
      date: timelineStats.ingestion_date
    },
    ...timelineStats.status_changes.map(change => ({
      x: new Date(change.changed_at).getTime(),
      y: getYCoordinate('status'),
      type: 'status' as const,
      title: `Status Changed to: ${change.new_status}`,
      date: change.changed_at
    })),
    ...timelineStats.account_executions.map(execution => ({
      x: new Date(execution.start_time).getTime(),
      y: getYCoordinate('execution'),
      type: 'execution' as const,
      title: `Execution: ${execution.type}`,
      date: execution.start_time
    }))
  ].sort((a, b) => a.x - b.x);

  const xDomain = lastDrawLocation && [
    lastDrawLocation.left,
    lastDrawLocation.right
  ];

  const yDomain = [0, 5];

  return (
    <div className="timeline-container" ref={containerRef}>
      {containerWidth > 0 && (
        <XYPlot
          width={containerWidth}
          height={300}
          xType="time"
          margin={{ left: 100, right: 50, top: 20, bottom: 50 }}
          xDomain={xDomain}
          yDomain={yDomain}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickFormat={v => new Date(v).toLocaleDateString()} tickLabelAngle={-45} />
          <YAxis 
            tickFormat={(v) => {
              switch (v) {
                case 4: return 'Creation';
                case 3: return 'Ingestion';
                case 2: return 'Status Changes';
                case 1: return 'Executions';
                default: return '';
              }
            }}
          />
          
          <MarkSeries
            data={allEvents}
            colorType="literal"
            getColor={d => getEventColor(d.type)}
            onValueMouseOver={(datapoint) => setHoveredPoint(datapoint as TimelineEvent)}
            onValueMouseOut={() => setHoveredPoint(null)}
            sizeRange={[8, 8]}
          />

          {hoveredPoint && (
            <Hint
              value={hoveredPoint}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                zIndex: 1000
              }}
            >
              {renderTooltipContent(hoveredPoint)}
            </Hint>
          )}

          <Highlight
            onBrushEnd={(area) => setLastDrawLocation(area)}
            enableY={false}
          />
        </XYPlot>
      )}

      <div className="timeline-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getEventColor('creation') }}></span>
          <span>Creation</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getEventColor('ingestion') }}></span>
          <span>Ingestion</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getEventColor('status') }}></span>
          <span>Status Change</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getEventColor('execution') }}></span>
          <span>Execution</span>
        </div>
      </div>

      {lastDrawLocation && (
        <button
          className="btn btn-sm btn-secondary mt-2"
          onClick={() => setLastDrawLocation(null)}
        >
          Reset Zoom
        </button>
      )}
    </div>
  );
};

export default Timeline; 