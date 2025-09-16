import React from "react";
import { getRecentRedirects } from "../mock.js";
import { Card } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Portfolio() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    setRows(getRecentRedirects());
  }, []);

  const clear = () => {
    localStorage.removeItem("stacks_portfolio_mock");
    setRows([]);
    toast("Cleared", { description: "Portfolio history cleared." });
  };

  const emptyIllustration = "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-[Sora] text-2xl text-zinc-900">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">Recent redirects and estimated returns. Testnet canary transactions will appear here later.</p>

      {rows.length === 0 ? (
        <Card className="mt-8 overflow-hidden border-white/40 bg-white/60 backdrop-blur-2xl">
          <img src={emptyIllustration} alt="empty" className="h-48 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-lg font-medium text-zinc-900">Start farming now</h3>
            <p className="mt-1 text-sm text-zinc-600">Explore opportunities and use the deposit button to add entries here.</p>
            <Link to="/opportunities" className="mt-4 inline-block text-emerald-700 hover:underline">Browse opportunities</Link>
          </div>
        </Card>
      ) : (
        <Card className="mt-8 border-white/40 bg-white/60 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-medium text-zinc-900">Recent activity</h3>
            <Button variant="outline" onClick={clear} className="border-zinc-300">Clear</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Est. Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => {
                  const est = (r.amount * (r.apr/100) * (r.days/365)).toFixed(2);
                  const when = new Date(r.ts).toLocaleString();
                  return (
                    <TableRow key={idx}>
                      <TableCell>{when}</TableCell>
                      <TableCell>{r.protocol}</TableCell>
                      <TableCell>
                        <Link to={`/opportunities/${r.id}`} className="text-emerald-700 hover:underline">{r.pair}</Link>
                      </TableCell>
                      <TableCell className="text-right">${r.amount}</TableCell>
                      <TableCell className="text-right">{r.apr}%</TableCell>
                      <TableCell className="text-right">{r.days}</TableCell>
                      <TableCell className="text-right">${est}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}