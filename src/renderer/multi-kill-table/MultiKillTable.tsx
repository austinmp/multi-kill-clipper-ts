import { useState, useEffect, FormEvent } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Checkbox from '@mui/material/Checkbox';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { TableFooter } from '@mui/material';
import styles from '../multi-kill-clipper.module.css';
import MultiKill from '../../main/app/models/multi-kill';
import MultiKillMatch from '../../main/app/models/multi-kill-match';
import KillTagCell from './KillTagCell';
import MultiKillTableRow from './MultiKillTableRow';
import ClipControls from '../clip-controls/ClipControls';

type MultiKillTableProps = {
  multiKillMatches: MultiKillMatch[] | null;
  selectedMultiKillMatch: MultiKillMatch | null;
  selectedMultiKill: MultiKill | null;
  setSelectedMultiKillMatch: (multiKillMatch: MultiKillMatch | null) => void;
  setSelectedMultiKill: (multiKill: MultiKill | null) => void;
};

export default function MultiKillTable({
  multiKillMatches,
  selectedMultiKillMatch,
  selectedMultiKill,
  setSelectedMultiKillMatch,
  setSelectedMultiKill,
}: MultiKillTableProps) {
  const handleMultiKillSelect = (
    multiKillMatch: MultiKillMatch,
    multiKill: MultiKill,
  ) => {
    if (selectedMultiKill?.id === multiKill.id) {
      // deselect if currently selected
      setSelectedMultiKill(null);
    } else {
      setSelectedMultiKill(multiKill);
      setSelectedMultiKillMatch(multiKillMatch);
    }
  };

  return (
    <TableContainer sx={{ maxHeight: 500, width: '90vw' }}>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow className={styles.tableHeader}>
            <TableCell />
            <TableCell align="left">Match Result</TableCell>
            <TableCell align="left">Queue Type</TableCell>
            <TableCell align="left">Multi Kills</TableCell>
            <TableCell align="left">Role</TableCell>
            <TableCell align="left">Champion</TableCell>
            <TableCell align="left">K/D/A</TableCell>
            <TableCell align="left">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {multiKillMatches?.map((multiKillMatch: MultiKillMatch) => (
            <MultiKillTableRow
              key={multiKillMatch.matchId}
              row={multiKillMatch}
              selectedMultiKill={selectedMultiKill}
              handleMultiKillSelect={handleMultiKillSelect}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
