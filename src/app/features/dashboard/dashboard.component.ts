import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { RouterLink } from '@angular/router';
import { CommunityDataService } from '../../core/services/community-data.service';

Chart.register(CategoryScale, Filler, LinearScale, LineController, LineElement, PointElement, Tooltip);

@Component({
  selector: 'app-dashboard',
  imports: [NgIcon, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('membershipChart') private membershipChartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  protected readonly community = inject(CommunityDataService);

  readonly metricCards = [
    { label: 'Total members', icon: 'lucideUsers', tone: 'green', route: '/members', key: 'totalMembers' },
    { label: 'Active volunteers', icon: 'lucideHandHelping', tone: 'blue', route: '/volunteers', key: 'activeVolunteers' },
    { label: 'Upcoming events', icon: 'lucideCalendarDays', tone: 'amber', route: '/events', key: 'upcomingEvents' },
    { label: 'Ongoing programmes', icon: 'lucideBookOpenCheck', tone: 'violet', route: '/programmes', key: 'ongoingProgrammes' },
  ] as const;

  ngAfterViewInit(): void {
    this.renderMembershipChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value));
  }

  relativeTime(value: string): string {
    const elapsedDays = Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000));
    if (elapsedDays <= 0) return 'Today';
    if (elapsedDays === 1) return 'Yesterday';
    return `${elapsedDays} days ago`;
  }

  private renderMembershipChart(): void {
    const canvas = this.membershipChartCanvas?.nativeElement;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const gradient = context.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(53, 84, 232, 0.18)');
    gradient.addColorStop(1, 'rgba(53, 84, 232, 0)');

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.community.memberGrowth().map((month) => month.label),
        datasets: [{
          label: 'New members',
          data: this.community.memberGrowth().map((month) => month.count),
          borderColor: '#3554e8',
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3554e8',
          pointBorderWidth: 2,
          tension: 0.38,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            backgroundColor: '#172340',
            padding: 10,
            titleFont: { family: 'DM Sans', size: 11, weight: 'normal' },
            bodyFont: { family: 'DM Sans', size: 12, weight: 'bold' },
            callbacks: { label: (context) => ` ${context.parsed.y} new members` },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9aa59f', font: { family: 'DM Sans', size: 10 } },
          },
          y: {
            beginAtZero: true,
            border: { display: false, dash: [4, 4] },
            grid: { color: '#eef2ef' },
            ticks: { color: '#9aa59f', precision: 0, font: { family: 'DM Sans', size: 10 }, padding: 10 },
          },
        },
      },
    });
  }
}
