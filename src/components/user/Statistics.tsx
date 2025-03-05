import React, { useState, useEffect } from 'react';
import {
  fetchOverallStatistics,
  fetchStatusStatistics,
  fetchAverageTimesBySource,
  fetchExecutionCountsBySource,
  fetchGroupedByModelStatistics,
  fetchTopSnapchatAccounts,
  fetchDailyAccountStats,
  fetchDailyChatbotRuns,
} from '../../services/statisticsService';
import { toast } from 'react-hot-toast';

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { BarChart, AccessTime, Lock } from '@mui/icons-material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useParams } from 'react-router-dom';

Chart.register(...registerables);

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const { agencyId } = useParams<{ agencyId: string }>();

  const [statusStatistics, setStatusStatistics] = useState<Record<string, string> | null>(null);
  const [averageTimesBySource, setAverageTimesBySource] = useState<Record<string, string> | null>(null);
  const [executionCountsBySource, setExecutionCountsBySource] = useState<Record<string, number> | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [groupedStatistics, setGroupedStatistics] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'overall' | 'grouped'>('overall');
  const [selectedModel, setSelectedModel] = useState<string>('overall');
  const [selectedTab, setSelectedTab] = useState(0);

  // Weights for top Snapchat accounts
  const [weightRejectingRate, setWeightRejectingRate] = useState(0.4);
  const [weightConversationRate, setWeightConversationRate] = useState(0.4);
  const [weightConversionRate, setWeightConversionRate] = useState(0.2);
  const [weightError, setWeightError] = useState('');

  // Accounts data
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [orderBy, setOrderBy] = useState('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Daily stats
  const [days, setDays] = useState<number>(7);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [dailyChatbotRuns, setDailyChatbotRuns] = useState<number | null>(null);

  // Handle sum of weights
  useEffect(() => {
    const totalWeight = weightRejectingRate + weightConversationRate + weightConversionRate;
    if (totalWeight !== 1) {
      setWeightError('The sum of weights must equal 1.');
    } else {
      setWeightError('');
    }
  }, [weightRejectingRate, weightConversationRate, weightConversionRate]);

  // Fetch overall & grouped stats
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoadingStats(true);
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const stats = await fetchOverallStatistics(agencyId);
        setStatistics(stats);
        const statusStats = await fetchStatusStatistics(agencyId);
        setStatusStatistics(statusStats);
        const averageTimes = await fetchAverageTimesBySource(agencyId);
        setAverageTimesBySource(averageTimes);
        const executionCounts = await fetchExecutionCountsBySource(agencyId);
        setExecutionCountsBySource(executionCounts);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    const loadGroupedStatistics = async () => {
      try {
        setLoadingStats(true);
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const groupedStats = await fetchGroupedByModelStatistics(agencyId);
        console.log('Fetched Grouped Statistics:', groupedStats);
        setGroupedStatistics(groupedStats);
      } catch (error) {
        console.error('Failed to load grouped statistics:', error);
        toast.error('Failed to load grouped statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    loadGroupedStatistics();
    loadStatistics();
  }, [agencyId, selectedModel]);

  const groupedStatsArray = Object.values(groupedStatistics);
  console.log('Grouped Stats Array:', groupedStatsArray);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedModel(newValue === 0 ? 'overall' : modelOptions[newValue]);
  };

  const modelOptions = ['Overall', ...groupedStatsArray.map((modelStats: any) => modelStats.model_name)];
  console.log('Model Options:', modelOptions);

  // Fetch top snap accounts
  const fetchAccountsData = async () => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchTopSnapchatAccounts(agencyId, weightRejectingRate, weightConversationRate, weightConversionRate);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch top Snapchat accounts:', error);
      toast.error('Failed to fetch top Snapchat accounts');
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [agencyId]);

  const handleApplyWeights = () => {
    if (!weightError) {
      fetchAccountsData();
    }
  };

  // Searching & Sorting
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAccounts = filteredAccounts.sort((a, b) => {
    if (orderBy === 'username') {
      return order === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    } else {
      return order === 'asc'
        ? a[orderBy] - b[orderBy]
        : b[orderBy] - a[orderBy];
    }
  });

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Username',
      flex: 1,
      renderCell: (params) => (
        <a
          href={`/snapchat-account/${params.row.account_id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', color: 'blue' }}
        >
          {params.value}
        </a>
      ),
    },
    { field: 'rejecting_rate', headerName: 'Rejecting Rate', type: 'number', flex: 1 },
    { field: 'conversation_rate', headerName: 'Conversation Rate', type: 'number', flex: 1 },
    { field: 'conversion_rate', headerName: 'Conversion Rate', type: 'number', flex: 1 },
    { field: 'score', headerName: 'Score', type: 'number', flex: 1 },
  ];

  // Daily stats
  const handleDaysChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDays = parseInt(event.target.value);
    setDays(selectedDays);
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchDailyAccountStats(agencyId, selectedDays);
      setDailyStats(data);
    } catch (error) {
      console.error('Failed to fetch daily stats:', error);
      toast.error('Failed to fetch daily stats');
    }
  };

  useEffect(() => {
    const fetchInitialDailyStats = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchDailyAccountStats(agencyId, days);
        setDailyStats(data);
      } catch (error) {
        console.error('Failed to fetch initial daily stats:', error);
        toast.error('Failed to fetch initial daily stats');
      }
    };

    fetchInitialDailyStats();
  }, [agencyId, days]);

  useEffect(() => {
    const fetchChatbotRuns = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const runs = await fetchDailyChatbotRuns(agencyId);
        setDailyChatbotRuns(runs);
      } catch (error) {
        console.error('Failed to fetch daily chatbot runs:', error);
        toast.error('Failed to fetch daily chatbot runs');
      }
    };

    fetchChatbotRuns();
  }, [agencyId]);

  return (
    <Container sx={{ mt: 5 }} className="statistics">
      {/* Title */}
      <Typography variant="h2" align="center" gutterBottom>
        {selectedModel === 'overall' ? 'Overall Statistics' : `${selectedModel} Statistics`}
      </Typography>

      {/* Tabs for switching between Overall / model stats */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        {modelOptions.map((option, index) => (
          <Tab key={option} label={option} />
        ))}
      </Tabs>

      {loadingStats ? (
        <Typography>Loading...</Typography>
      ) : selectedModel === 'overall' ? (
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {/* FIRST CARD: Platform Statistics */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" color="primary" gutterBottom>
                  <BarChart /> Platform Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Quick Adds Sent"
                      secondary={statistics?.quick_ads_sent || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Generated Leads"
                      secondary={statistics?.generated_leads || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Conversations"
                      secondary={
                        <>
                          {statistics?.total_conversations || 'N/A'}
                          {statistics?.quick_ads_sent > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              (
                              {(
                                (statistics.total_conversations /
                                  statistics.quick_ads_sent) *
                                100
                              ).toFixed(1)}
                              % of quick adds)
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Executions"
                      secondary={statistics?.total_executions || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Successful Executions"
                      secondary={
                        <>
                          {statistics?.successful_executions || 'N/A'}
                          {statistics?.total_executions > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              (
                              {(
                                (statistics.successful_executions /
                                  statistics.total_executions) *
                                100
                              ).toFixed(1)}
                              % success rate)
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Rejected Users"
                      secondary={
                        <>
                          {statistics?.rejected_total || 'N/A'}
                          {statistics?.quick_ads_sent + statistics?.rejected_total > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              (
                              {(
                                (statistics.rejected_total /
                                  (statistics.quick_ads_sent +
                                    statistics.rejected_total +
                                    statistics.generated_leads)) *
                                100
                              ).toFixed(1)}
                              % from{' '}
                              {statistics.quick_ads_sent +
                                statistics.rejected_total +
                                statistics.generated_leads}{' '}
                              checks)
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          {/* Add additional cards if needed */}
        </Grid>
      ) : (
        // GROUPED STATS
        <Grid container spacing={4}>
          {groupedStatsArray
            .filter((modelStats: any) => modelStats.model_name === selectedModel)
            .map((modelStats: any) => (
              <React.Fragment key={modelStats.model_name}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" color="primary" gutterBottom>
                        <BarChart /> {modelStats.model_name} Platform Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Quick Adds Sent"
                            secondary={modelStats.statistics.quick_ads_sent || 'N/A'}
                          />
                        </ListItem>
                        {/* ... similar to your original logic ... */}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Add other cards (Chatbot, Conversions) similarly */}
              </React.Fragment>
            ))}
        </Grid>
      )}

      {/* Status statistics */}
      {statusStatistics && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h4" align="center" color="info.main" gutterBottom>
            <AccessTime /> Avg Time Spent in Status
          </Typography>
          <List>
            {Object.entries(statusStatistics).map(([status, time]) => (
              <ListItem
                key={status}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <ListItemText primary={status} />
                <Badge
                  badgeContent={time}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '1rem',
                      padding: '0.75em 1em',
                      minWidth: '10em',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Average times by source */}
      {averageTimesBySource && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h4" align="center" color="secondary.main" gutterBottom>
            <AccessTime /> Avg Time Spent in Good Status by Source
          </Typography>
          <List>
            {Object.entries(averageTimesBySource).map(([source, time]) => (
              <ListItem
                key={source}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <ListItemText primary={source} />
                <Badge
                  badgeContent={time}
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '1rem',
                      padding: '0.75em 1em',
                      minWidth: '10em',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Execution counts by source */}
      {executionCountsBySource && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h4" align="center" color="error.main" gutterBottom>
            <Lock /> Avg Executions Until Account Was Locked
          </Typography>
          <List>
            {Object.entries(executionCountsBySource).map(([source, count]) => (
              <ListItem
                key={source}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <ListItemText primary={source} />
                <Badge
                  badgeContent={count}
                  color="success"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '1rem',
                      padding: '0.75em 1em',
                      minWidth: '10em',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Daily chatbot runs (optional) */}
      {/* 
      {dailyChatbotRuns !== null && (
        <Card variant="outlined" sx={{ marginBottom: '20px', mt: 4 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Daily Chatbot Runs: {dailyChatbotRuns}
            </Typography>
          </CardContent>
        </Card>
      )}
      */}

      {/* Daily account stats line chart */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ marginRight: '20px' }}>
          Daily Account Statistics
        </Typography>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="days-selector" style={{ marginRight: '10px' }}>
            Select Days:
          </label>
          <select
            id="days-selector"
            value={days}
            onChange={handleDaysChange}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={21}>21 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>
        <Line
          data={{
            labels: dailyStats.map((stat) => stat.day),
            datasets: [
              {
                label: 'Accounts Ran',
                data: dailyStats.map((stat) => stat.accounts_ran),
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
              },
              {
                label: 'Total Quick Ads Sent',
                data: dailyStats.map((stat) => stat.total_quick_ads_sent),
                borderColor: 'rgba(153,102,255,1)',
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                },
              },
            },
          }}
        />
      </div>

      {/* Example of adjusting weights and showing top accounts (optional) */}
      {/* 
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Typography variant="h4" gutterBottom>
          Top Snapchat Accounts
        </Typography>
        <Typography variant="h6">Adjust Weights</Typography>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Rejecting Rate"
            type="number"
            value={weightRejectingRate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setWeightRejectingRate(val);
            }}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
          <TextField
            label="Conversation Rate"
            type="number"
            value={weightConversationRate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setWeightConversationRate(val);
            }}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
          <TextField
            label="Conversion Rate"
            type="number"
            value={weightConversionRate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setWeightConversionRate(val);
            }}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
        </div>
        {weightError && (
          <Typography color="error" gutterBottom>
            {weightError}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyWeights}
          disabled={Boolean(weightError)}
        >
          Apply Weights
        </Button>
      </div>

      <Paper sx={{ height: 600, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={accounts.map((account, index) => ({ id: index, ...account }))}
          columns={columns}
          hideFooter
        />
      </Paper>
      */}
    </Container>
  );
};

export default Statistics;
