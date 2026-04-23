"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Copy, Download } from "lucide-react"
import { formatCurrency, calcClientRate, calcCommission } from "@/lib/rate-utils"
import { DELIVERABLE_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface LineItem {
  id: string
  label: string
  platform: string
  qty: number
  creatorRate: number
  clientRate: number
  commission: number
  isManual: boolean
}

interface SimpleCreator {
  id: string
  name: string
  tier: string
  [key: string]: unknown
}

function newId() {
  return Math.random().toString(36).slice(2)
}

export default function RateCalculatorPage() {
  const [items, setItems] = useState<LineItem[]>([])
  const [creators, setCreators] = useState<SimpleCreator[]>([])
  const [settings, setSettings] = useState({ serviceMarkup: 0.12, agencyCommission: 0.20 })

  useEffect(() => {
    Promise.all([
      fetch("/api/creators").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([c, s]) => {
      setCreators(Array.isArray(c) ? c : [])
      setSettings({ serviceMarkup: s.serviceMarkup ?? 0.12, agencyCommission: s.agencyCommission ?? 0.20 })
    })
  }, [])

  const addManualItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        label: "Custom Deliverable",
        platform: "Any",
        qty: 1,
        creatorRate: 0,
        clientRate: 0,
        commission: 0,
        isManual: true,
      },
    ])
  }

  const addFromCreator = (creatorId: string, deliverableKey: string) => {
    const creator = creators.find((c) => c.id === creatorId)
    if (!creator) return
    const deliverable = DELIVERABLE_TYPES.find((d) => d.key === deliverableKey)
    if (!deliverable) return
    const rate = creator[deliverableKey] as number
    if (!rate) return

    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        label: `${creator.name} — ${deliverable.label}`,
        platform: deliverable.platform,
        qty: 1,
        creatorRate: rate,
        clientRate: calcClientRate(rate, settings.serviceMarkup),
        commission: calcCommission(rate, settings.agencyCommission),
        isManual: false,
      },
    ])
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "creatorRate") {
          const rate = Number(value)
          updated.clientRate = calcClientRate(rate, settings.serviceMarkup)
          updated.commission = calcCommission(rate, settings.agencyCommission)
        }
        return updated
      })
    )
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const totals = items.reduce(
    (acc, item) => ({
      creator: acc.creator + item.creatorRate * item.qty,
      client: acc.client + item.clientRate * item.qty,
      commission: acc.commission + item.commission * item.qty,
    }),
    { creator: 0, client: 0, commission: 0 }
  )

  const copyAsText = () => {
    const header = "Deliverable | Platform | Qty | Creator Rate | Client Rate | Commission\n"
    const divider = "-".repeat(80) + "\n"
    const rows = items
      .map(
        (i) =>
          `${i.label} | ${i.platform} | ${i.qty} | ${formatCurrency(i.creatorRate * i.qty)} | ${formatCurrency(i.clientRate * i.qty)} | ${formatCurrency(i.commission * i.qty)}`
      )
      .join("\n")
    const footer = `\nTotals: Creator ${formatCurrency(totals.creator)} | Client ${formatCurrency(totals.client)} | Commission ${formatCurrency(totals.commission)}`
    navigator.clipboard.writeText(header + divider + rows + footer)
  }

  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFillColor(245, 230, 66)
    doc.rect(0, 0, pageWidth, 30, "F")
    doc.setTextColor(10, 4, 18)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("LUMOS — Rate Calculation", 20, 20)

    autoTable(doc, {
      startY: 40,
      head: [["Deliverable", "Platform", "Qty", "Creator Rate", "Client Rate", "Commission"]],
      body: items.map((i) => [
        i.label,
        i.platform,
        i.qty.toString(),
        formatCurrency(i.creatorRate * i.qty),
        formatCurrency(i.clientRate * i.qty),
        formatCurrency(i.commission * i.qty),
      ]),
      foot: [["Totals", "", "", formatCurrency(totals.creator), formatCurrency(totals.client), formatCurrency(totals.commission)]],
      headStyles: { fillColor: [245, 230, 66], textColor: [10, 4, 18] },
      footStyles: { fillColor: [245, 166, 35], textColor: [255, 255, 255], fontStyle: "bold" },
    })

    doc.save("lumos_rate_calculation.pdf")
  }

  const [selectedCreator, setSelectedCreator] = useState("")
  const [selectedDeliverable, setSelectedDeliverable] = useState("")

  const selectedCreatorData = creators.find((c) => c.id === selectedCreator)
  const availableDeliverables = selectedCreatorData
    ? DELIVERABLE_TYPES.filter((d) => {
        const r = selectedCreatorData[d.key]
        return r != null && (r as number) > 0
      })
    : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Add items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">From Creator Database</h3>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Creator</label>
            <select
              value={selectedCreator}
              onChange={(e) => { setSelectedCreator(e.target.value); setSelectedDeliverable("") }}
              className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5E642]"
            >
              <option value="">Select creator...</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {selectedCreator && (
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Deliverable</label>
              <select
                value={selectedDeliverable}
                onChange={(e) => setSelectedDeliverable(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5E642]"
              >
                <option value="">Select deliverable...</option>
                {availableDeliverables.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label} — {formatCurrency(selectedCreatorData?.[d.key] as number || 0)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedCreator && selectedDeliverable && (
            <button
              onClick={() => {
                addFromCreator(selectedCreator, selectedDeliverable)
                setSelectedDeliverable("")
              }}
              className="w-full py-2 bg-[#F5E642] text-[#0A0412] font-semibold text-sm rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
            >
              Add to Calculation
            </button>
          )}
        </div>

        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
          <h3 className="font-cinzel font-semibold text-white mb-3">Manual Entry</h3>
          <button
            onClick={addManualItem}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[rgba(245,230,66,0.2)] rounded-lg text-[#A89BC2] hover:text-white hover:border-[rgba(245,230,66,0.4)] text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Manual Line Item
          </button>
        </div>
      </div>

      {/* Right: Calculation table */}
      <div className="lg:col-span-3">
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl overflow-hidden mb-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#A89BC2]">
              <p className="text-sm">Add deliverables from the left panel to start calculating.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[rgba(245,230,66,0.1)]">
                      {["Deliverable", "Qty", "Creator Rate", "Client Rate", "Commission", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#F5E642] font-cinzel uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id} className={cn("border-b border-[rgba(245,230,66,0.1)] last:border-0 hover:bg-[rgba(245,230,66,0.04)] cursor-pointer transition-colors", i % 2 === 0 ? "" : "bg-[#0A0412]")}>
                        <td className="px-4 py-3">
                          {item.isManual ? (
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItem(item.id, "label", e.target.value)}
                              className="w-full bg-transparent text-white text-sm focus:outline-none focus:border-b focus:border-[#F5E642]"
                            />
                          ) : (
                            <span className="text-white">{item.label}</span>
                          )}
                          <p className="text-[10px] text-[#A89BC2]">{item.platform}</p>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white text-xs text-center focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {item.isManual ? (
                            <input
                              type="number"
                              min="0"
                              value={item.creatorRate}
                              onChange={(e) => updateItem(item.id, "creatorRate", parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white text-xs text-right focus:outline-none font-mono"
                            />
                          ) : (
                            <span className="font-mono text-white">{formatCurrency(item.creatorRate * item.qty)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#F5E642] font-semibold">
                          {formatCurrency(item.clientRate * item.qty)}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
                          {formatCurrency(item.commission * item.qty)}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => removeItem(item.id)} className="text-[#A89BC2] hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[rgba(245,230,66,0.1)] bg-[#1A0A2E]">
                      <td className="px-4 py-3 font-semibold text-white text-xs uppercase tracking-wider" colSpan={2}>Totals</td>
                      <td className="px-4 py-3 font-mono font-semibold text-white">{formatCurrency(totals.creator)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#F5E642]">{formatCurrency(totals.client)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{formatCurrency(totals.commission)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={copyAsText}
              className="flex items-center gap-2 px-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy as Text
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5E642] text-[#0A0412] font-semibold text-sm rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
