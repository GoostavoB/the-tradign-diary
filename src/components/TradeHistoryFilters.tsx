import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface TradeFilters {
  search: string;
  side: 'all' | 'long' | 'short';
  outcome: 'all' | 'win' | 'loss';
  broker: string;
  setup: string;
  emotionalTag: string;
  minPnl: string;
  maxPnl: string;
  minROI: string;
  maxROI: string;
}

interface TradeHistoryFiltersProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  availableBrokers: string[];
  availableSetups: string[];
  availableEmotionalTags: string[];
}

export const TradeHistoryFilters = ({
  filters,
  onFiltersChange,
  availableBrokers,
  availableSetups,
  availableEmotionalTags,
}: TradeHistoryFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilter = (key: keyof TradeFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      side: 'all',
      outcome: 'all',
      broker: 'all',
      setup: 'all',
      emotionalTag: 'all',
      minPnl: '',
      maxPnl: '',
      minROI: '',
      maxROI: '',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (['side', 'outcome', 'broker', 'setup', 'emotionalTag'].includes(key)) {
      return value !== 'all';
    }
    return value !== '';
  }).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol, broker, setup..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Side Filter */}
        <Select value={filters.side} onValueChange={(value) => updateFilter('side', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sides</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick Outcome Filter */}
        <Select value={filters.outcome} onValueChange={(value) => updateFilter('outcome', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
            <SelectItem value="loss">Losses</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Broker Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Broker</Label>
                <Select value={filters.broker} onValueChange={(value) => updateFilter('broker', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brokers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brokers</SelectItem>
                    {availableBrokers.map((broker) => (
                      <SelectItem key={broker} value={broker}>
                        {broker}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Setup Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Setup</Label>
                <Select value={filters.setup} onValueChange={(value) => updateFilter('setup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Setups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Setups</SelectItem>
                    {availableSetups.map((setup) => (
                      <SelectItem key={setup} value={setup}>
                        {setup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emotional Tag Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Emotional Tag</Label>
                <Select value={filters.emotionalTag} onValueChange={(value) => updateFilter('emotionalTag', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {availableEmotionalTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* P&L Range */}
              <div className="space-y-2">
                <Label className="text-xs">P&L Range ($)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPnl}
                    onChange={(e) => updateFilter('minPnl', e.target.value)}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPnl}
                    onChange={(e) => updateFilter('maxPnl', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* ROI Range */}
              <div className="space-y-2">
                <Label className="text-xs">ROI Range (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minROI}
                    onChange={(e) => updateFilter('minROI', e.target.value)}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxROI}
                    onChange={(e) => updateFilter('maxROI', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          
          {filters.side !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.side}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('side', 'all')}
              />
            </Badge>
          )}
          
          {filters.outcome !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.outcome}s
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('outcome', 'all')}
              />
            </Badge>
          )}

          {filters.broker !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.broker}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('broker', 'all')}
              />
            </Badge>
          )}

          {filters.setup !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.setup}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('setup', 'all')}
              />
            </Badge>
          )}

          {(filters.minPnl || filters.maxPnl) && (
            <Badge variant="secondary" className="gap-1">
              P&L: {filters.minPnl || '∞'} to {filters.maxPnl || '∞'}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  updateFilter('minPnl', '');
                  updateFilter('maxPnl', '');
                }}
              />
            </Badge>
          )}

          {(filters.minROI || filters.maxROI) && (
            <Badge variant="secondary" className="gap-1">
              ROI: {filters.minROI || '∞'}% to {filters.maxROI || '∞'}%
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  updateFilter('minROI', '');
                  updateFilter('maxROI', '');
                }}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
