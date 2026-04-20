export function DashboardFooter() {
  return (
    <footer className="mt-6 flex flex-col gap-1 text-center text-sm text-muted-foreground">
      <div>megawood Service Dashboard</div>
      <div>Powered by Customer Insights and Live Conversation Monitoring</div>
      <div>© {new Date().getFullYear()} megawood</div>
    </footer>
  );
}
