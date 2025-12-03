'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, User, Building2 } from "lucide-react"

export default function CompanyInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="text-green-600 font-bold cursor-pointer hover:underline hover:text-green-400 transition-colors">
          Sztywny Kod
        </span>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-green-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-green-500 tracking-tighter uppercase flex items-center gap-2">
            <Building2 className="w-6 h-6"/> Sztywny Kod & Spółka
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Lider konsorcjum programistycznego "Na Rejonie"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
            {/* DANE ADRESOWE */}
            <div className="p-4 bg-black rounded border border-zinc-800 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Siedziba Główna</p>
                    <p className="font-mono text-sm">Kwietniewo 47</p>
                </div>
            </div>

            {/* DANE OSOBOWE */}
            <div className="p-4 bg-black rounded border border-zinc-800 flex items-start gap-3">
                <User className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Reprezentacja</p>
                    <p className="font-bold">Kacper Szponar</p>
                    <Badge variant="outline" className="mt-1 border-zinc-700 text-zinc-400 text-[10px]">
                        Główny Programista / Członek Związku Sztywnych Gitów Na Wolności
                    </Badge>
                    <p className="font-bold">Masny Jim</p>
                    <Badge variant="outline" className="mt-1 border-zinc-700 text-zinc-400 text-[10px]">
                        Asystent Programisty / Sztuczna
                    </Badge>
                </div>
            </div>

            {/* STOPKA MODALA */}
            <div className="text-center pt-2">
                <p className="text-s text-zinc-600 italic">
                    "Kodujemy sztywno, wozimy się pomału."
                </p>
                <p className="text-[12px] text-zinc-700 mt-">
                    NIP: BRAK (Działalność rejestrowana na zasadach ulicy)
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}