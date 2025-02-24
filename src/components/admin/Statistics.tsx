import React, { useState, useEffect } from 'react';
import { fetchOverallStatistics, fetchStatusStatistics, fetchAverageTimesBySource, fetchExecutionCountsBySource, fetchGroupedByModelStatistics, fetchTopSnapchatAccounts, fetchDailyAccountStats, fetchDailyChatbotRuns } from '../../services/statisticsService';
import { toast } from 'react-hot-toast';
import { Container, Grid, Card, CardContent, Typography, List, ListItem, ListItemText, Badge, Tabs, Tab, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, InputAdornment, IconButton } from '@mui/material';
import { BarChart, AccessTime, Lock, Search } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [statusStatistics, setStatusStatistics] = useState<Record<string, string> | null>(null);
  const [averageTimesBySource, setAverageTimesBySource] = useState<Record<string, string> | null>(null);
  const [executionCountsBySource, setExecutionCountsBySource] = useState<Record<string, number> | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [groupedStatistics, setGroupedStatistics] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'overall' | 'grouped'>('overall');
  const [selectedModel, setSelectedModel] = useState<string>('overall');
  const [selectedTab, setSelectedTab] = useState(0);
  const [weightRejectingRate, setWeightRejectingRate] = useState(0.4);
  const [weightConversationRate, setWeightConversationRate] = useState(0.4);
  const [weightConversionRate, setWeightConversionRate] = useState(0.2);
  const [weightError, setWeightError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [days, setDays] = useState<number>(7);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [dailyChatbotRuns, setDailyChatbotRuns] = useState<number | null>(null);

  const handleWeightChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    let newValue = value;
    if (newValue === '0') {
      newValue = '0.'; // Automatically add a decimal point
    }
    if (newValue.startsWith('0.') || newValue === '0.') {
      setter(parseFloat(newValue));
    } else {
      const parsedValue = parseFloat(newValue);
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
        setter(parsedValue);
      }
    }
  };

  useEffect(() => {
    const totalWeight = weightRejectingRate + weightConversationRate + weightConversionRate;
    if (totalWeight !== 1) {
      setWeightError('The sum of weights must equal 1.');
    } else {
      setWeightError('');
    }
  }, [weightRejectingRate, weightConversationRate, weightConversionRate]);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoadingStats(true);
        const stats = await fetchOverallStatistics();
        setStatistics(stats);
        const statusStats = await fetchStatusStatistics();
        setStatusStatistics(statusStats);
        const averageTimes = await fetchAverageTimesBySource();
        setAverageTimesBySource(averageTimes);
        const executionCounts = await fetchExecutionCountsBySource();
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
        const groupedStats = await fetchGroupedByModelStatistics();
        console.log('Fetched Grouped Statistics:', groupedStats);
        setGroupedStatistics(groupedStats);
      } catch (error) {
        console.error('Failed to load grouped statistics:', error);
        toast.error('Failed to load grouped statistics');
      } finally {
        setLoadingStats(false);
      }
    };

      loadGroupedStatistics()

      loadStatistics()
  }, [selectedModel]);

  const groupedStatsArray = Object.values(groupedStatistics);
  console.log('Grouped Stats Array:', groupedStatsArray);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedModel(newValue === 0 ? 'overall' : modelOptions[newValue]);
  };

  const modelOptions = ['Overall', ...groupedStatsArray.map((modelStats) => modelStats.model_name)];
  console.log('Model Options:', modelOptions);

  const fetchAccounts = async () => {
    try {
      const data = await fetchTopSnapchatAccounts(weightRejectingRate, weightConversationRate, weightConversionRate);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch top Snapchat accounts:', error);
      toast.error('Failed to fetch top Snapchat accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleApplyWeights = () => {
    if (weightError === '') {
      fetchAccounts();
    }
  };

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

  const handleDaysChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDays = parseInt(event.target.value);
    setDays(selectedDays);
    try {
      const data = await fetchDailyAccountStats(selectedDays);
      setDailyStats(data);
    } catch (error) {
      console.error('Failed to fetch daily stats:', error);
      toast.error('Failed to fetch daily stats');
    }
  };

  useEffect(() => {
    const fetchInitialDailyStats = async () => {
      try {
        const data = await fetchDailyAccountStats(days);
        setDailyStats(data);
      } catch (error) {
        console.error('Failed to fetch initial daily stats:', error);
        toast.error('Failed to fetch initial daily stats');
      }
    };

    fetchInitialDailyStats();
  }, []);

  useEffect(() => {
    const fetchChatbotRuns = async () => {
      try {
        const runs = await fetchDailyChatbotRuns();
        setDailyChatbotRuns(runs);
      } catch (error) {
        console.error('Failed to fetch daily chatbot runs:', error);
        toast.error('Failed to fetch daily chatbot runs');
      }
    };

    fetchChatbotRuns();
  }, []);

  return (
    <Container className="statistics" sx={{ mt: 5 }}>
      <Typography variant="h2" align="center" gutterBottom>
        {selectedModel === 'overall' ? 'Overall Statistics' : `${selectedModel} Statistics`}
      </Typography>
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
        <div>Loading...</div>
      ) : selectedModel === 'overall' ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" color="primary" gutterBottom><BarChart /> Platform Statistics</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Quick Adds Sent" secondary={statistics?.quick_ads_sent || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Generated Leads" secondary={statistics?.generated_leads || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Conversations" secondary={
                      <>
                        {statistics?.total_conversations || 'N/A'}
                        {statistics?.quick_ads_sent > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.total_conversations / statistics.quick_ads_sent) * 100).toFixed(1)}% of quick adds)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Executions" secondary={statistics?.total_executions || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Successful Executions" secondary={
                      <>
                        {statistics?.successful_executions || 'N/A'}
                        {statistics?.total_executions > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.successful_executions / statistics.total_executions) * 100).toFixed(1)}% success rate)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Rejected Users" secondary={
                      <>
                        {statistics?.rejected_total || 'N/A'}
                        {statistics?.quick_ads_sent + statistics?.rejected_total > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.rejected_total / (statistics.quick_ads_sent + statistics.rejected_total + statistics.generated_leads)) * 100).toFixed(1)}% from {(statistics.quick_ads_sent + statistics.rejected_total + statistics.generated_leads)} checks)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" color="success.main" gutterBottom><BarChart /> Chatbot Statistics</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Chatbot Conversations" secondary={
                      <>
                        {statistics?.chatbot_conversations || 'N/A'}
                        {statistics?.total_conversations > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.chatbot_conversations / statistics.total_conversations) * 100).toFixed(1)}% of total)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Charged Conversations" secondary={
                      <>
                        {statistics?.conversations_charged || 'N/A'}
                        {statistics?.chatbot_conversations > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.conversations_charged / statistics.chatbot_conversations) * 100).toFixed(1)}% of chatbot)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="CTA Conversations" secondary={
                      <>
                        {statistics?.cta_conversations || 'N/A'}
                        {statistics?.conversations_charged > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.cta_conversations / statistics.conversations_charged) * 100).toFixed(1)}% of charged)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Shared Links" secondary={
                      <>
                        {statistics?.cta_shared_links || 'N/A'}
                        {statistics?.cta_conversations > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            ({((statistics.cta_shared_links / statistics.cta_conversations) * 100).toFixed(1)}% of CTA conv.)
                          </Typography>
                        )}
                      </>
                    } />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" color="warning.main" gutterBottom><BarChart /> Conversions</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Total Conversions" secondary={statistics?.total_conversions || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From Quick Adds" secondary={
                      statistics?.quick_ads_sent > 0 
                        ? `${((statistics.total_conversions / statistics.quick_ads_sent) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From Total Conversations" secondary={
                      statistics?.total_conversations > 0 
                        ? `${((statistics.total_conversions / statistics.total_conversations) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From Chatbot Conversations" secondary={
                      statistics?.chatbot_conversations > 0 
                        ? `${((statistics.total_conversions / statistics.chatbot_conversations) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From Charged Conversations" secondary={
                      statistics?.conversations_charged > 0 
                        ? `${((statistics.total_conversions / statistics.conversations_charged) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From CTA Conversations" secondary={
                      statistics?.cta_conversations > 0 
                        ? `${((statistics.total_conversions / statistics.cta_conversations) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="From Shared Links" secondary={
                      statistics?.cta_shared_links > 0 
                        ? `${((statistics.total_conversions / statistics.cta_shared_links) * 100).toFixed(1)}%`
                        : 'N/A'
                    } />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={4}>
          {groupedStatsArray.filter((modelStats) => modelStats.model_name === selectedModel).map((modelStats) => (
            <>
              <Grid item xs={12} md={4} key={`${modelStats.model_name}-platform`}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom><BarChart /> {modelStats.model_name} Platform Statistics</Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Quick Adds Sent" secondary={modelStats.statistics.quick_ads_sent || 'N/A'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Generated Leads" secondary={modelStats.statistics.generated_leads || 'N/A'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Total Conversations" secondary={
                          <>
                            {modelStats.statistics.total_conversations || 'N/A'}
                            {modelStats.statistics.quick_ads_sent > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.total_conversations / modelStats.statistics.quick_ads_sent) * 100).toFixed(1)}% of quick adds)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Total Executions" secondary={modelStats.statistics.total_executions || 'N/A'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Successful Executions" secondary={
                          <>
                            {modelStats.statistics.successful_executions || 'N/A'}
                            {modelStats.statistics.total_executions > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.successful_executions / modelStats.statistics.total_executions) * 100).toFixed(1)}% success rate)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Rejected Users" secondary={
                          <>
                            {modelStats.statistics.rejected_total || 'N/A'}
                            {modelStats.statistics.quick_ads_sent + modelStats.statistics.rejected_total > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.rejected_total / (modelStats.statistics.quick_ads_sent + modelStats.statistics.rejected_total)) * 100).toFixed(1)}% from {(modelStats.statistics.quick_ads_sent + modelStats.statistics.rejected_total)} checks)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4} key={`${modelStats.model_name}-chatbot`}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" color="success.main" gutterBottom><BarChart /> {modelStats.model_name} Chatbot Statistics</Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Chatbot Conversations" secondary={
                          <>
                            {modelStats.statistics.chatbot_conversations || 'N/A'}
                            {modelStats.statistics.total_conversations > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.chatbot_conversations / modelStats.statistics.total_conversations) * 100).toFixed(1)}% of total)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Charged Conversations" secondary={
                          <>
                            {modelStats.statistics.conversations_charged || 'N/A'}
                            {modelStats.statistics.chatbot_conversations > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.conversations_charged / modelStats.statistics.chatbot_conversations) * 100).toFixed(1)}% of chatbot)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="CTA Conversations" secondary={
                          <>
                            {modelStats.statistics.cta_conversations || 'N/A'}
                            {modelStats.statistics.conversations_charged > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.cta_conversations / modelStats.statistics.conversations_charged) * 100).toFixed(1)}% of charged)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Shared Links" secondary={
                          <>
                            {modelStats.statistics.cta_shared_links || 'N/A'}
                            {modelStats.statistics.cta_conversations > 0 && (
                              <Typography variant="caption" color="textSecondary">
                                ({((modelStats.statistics.cta_shared_links / modelStats.statistics.cta_conversations) * 100).toFixed(1)}% of CTA conv.)
                              </Typography>
                            )}
                          </>
                        } />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4} key={`${modelStats.model_name}-conversions`}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" color="warning.main" gutterBottom><BarChart /> {modelStats.model_name} Conversions</Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Total Conversions" secondary={modelStats.statistics.total_conversions || 'N/A'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From Quick Adds" secondary={
                          modelStats.statistics.quick_ads_sent > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.quick_ads_sent) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From Total Conversations" secondary={
                          modelStats.statistics.total_conversations > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.total_conversations) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From Chatbot Conversations" secondary={
                          modelStats.statistics.chatbot_conversations > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.chatbot_conversations) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From Charged Conversations" secondary={
                          modelStats.statistics.conversations_charged > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.conversations_charged) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From CTA Conversations" secondary={
                          modelStats.statistics.cta_conversations > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.cta_conversations) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="From Shared Links" secondary={
                          modelStats.statistics.cta_shared_links > 0 
                            ? `${((modelStats.statistics.total_conversions / modelStats.statistics.cta_shared_links) * 100).toFixed(1)}%`
                            : 'N/A'
                        } />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ))}
        </Grid>
      )}
      
      {statusStatistics && (
        <div className="status-statistics mt-4">
          <Typography variant="h4" align="center" color="info.main" gutterBottom><AccessTime /> Avg Time Spent in Status</Typography>
          <List>
            {Object.entries(statusStatistics).map(([status, time]) => (
              <ListItem key={status} className="list-group-item d-flex justify-content-between align-items-center">
                <ListItemText primary={status} />
                <Badge badgeContent={time} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '1rem', padding: '0.75em 1em', minWidth: '10em' } }} />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {averageTimesBySource && (
        <div className="average-times-by-source mt-4">
          <Typography variant="h4" align="center" color="secondary.main" gutterBottom><AccessTime /> Avg Time Spent in Good Status by Source</Typography>
          <List>
            {Object.entries(averageTimesBySource).map(([source, time]) => (
              <ListItem key={source} className="list-group-item d-flex justify-content-between align-items-center">
                <ListItemText primary={source} />
                <Badge badgeContent={time} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '1rem', padding: '0.75em 1em', minWidth: '10em' } }} />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {executionCountsBySource && (
        <div className="execution-counts-by-source mt-4">
          <Typography variant="h4" align="center" color="error.main" gutterBottom><Lock /> Avg Executions Until Account Was Locked</Typography>
          <List>
            {Object.entries(executionCountsBySource).map(([source, count]) => (
              <ListItem key={source} className="list-group-item d-flex justify-content-between align-items-center">
                <ListItemText primary={source} />
                <Badge badgeContent={count} color="success" sx={{ '& .MuiBadge-badge': { fontSize: '1rem', padding: '0.75em 1em', minWidth: '10em' } }} max={Infinity} />
              </ListItem>
            ))}
          </List>
        </div>
      )}
      {dailyChatbotRuns !== null && (
        <Card variant="outlined" sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Daily Chatbot Runs: {dailyChatbotRuns}
            </Typography>
          </CardContent>
        </Card>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ marginRight: '20px' }}>
          Daily Account Statistics
        </Typography>
        <div>
          <label htmlFor="days-selector" style={{ marginRight: '10px' }}>Select Days:</label>
          <select id="days-selector" value={days} onChange={handleDaysChange} style={{ padding: '5px', borderRadius: '4px' }}>
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={21}>21 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>
      </div>
      <Line
        data={{
          labels: dailyStats.map(stat => stat.day),
          datasets: [
            {
              label: 'Accounts Ran',
              data: dailyStats.map(stat => stat.accounts_ran),
              borderColor: 'rgba(75,192,192,1)',
              fill: false,
            },
            {
              label: 'Total Quick Ads Sent',
              data: dailyStats.map(stat => stat.total_quick_ads_sent),
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

      <Typography variant="h4" align="center" gutterBottom>Top Snapchat Accounts</Typography>

      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Typography variant="h6">Adjust Weights</Typography>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <TextField
            label="Rejecting Rate"
            type="number"
            value={weightRejectingRate}
            onChange={(e) => handleWeightChange(setWeightRejectingRate, e.target.value)}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
          <TextField
            label="Conversation Rate"
            type="number"
            value={weightConversationRate}
            onChange={(e) => handleWeightChange(setWeightConversationRate, e.target.value)}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
          <TextField
            label="Conversions Rate"
            type="number"
            value={weightConversionRate}
            onChange={(e) => handleWeightChange(setWeightConversionRate, e.target.value)}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            variant="outlined"
            style={{ minWidth: '150px' }}
          />
        </div>
        {weightError && <Typography color="error" gutterBottom>{weightError}</Typography>}
        <Button variant="contained" color="primary" onClick={handleApplyWeights} disabled={weightError !== ''}>
          Apply Weights
        </Button>
      </div>
    
      
      <Paper sx={{ height: 600, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={accounts.map((account, index) => ({ id: index, ...account }))}
          columns={columns}
          hideFooterPagination
          hideFooterRowCount
          hideFooterSelectedRowCount
          sx={{ border: 0 }}
        />
      </Paper>
    </Container>
  );

  
};

export default Statistics; 