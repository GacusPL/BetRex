import Link from "next/link"
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ArrowLeft } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden">
      
      {/* PRZYCISK POWROTU (Lewy górny róg) */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć na stronę główną
          </Button>
        </Link>
      </div>

      {/* TŁO AMBIENTOWE */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-green-600/20 p-3 rounded-full border border-green-500/30">
                <Zap className="w-8 h-8 text-green-500" />
             </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-white">
            WBIJAJ NA <span className="text-green-500">BET</span><span className="text-white">REX</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Zaloguj się, żeby obstawiać mecze i zgarnąć szacunek.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-gray-400 font-bold">LOGOWANIE</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 font-bold">REJESTRACJA</TabsTrigger>
            </TabsList>
            
            {/* --- ZAKŁADKA LOGOWANIA --- */}
            <TabsContent value="login">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="prezes@papito.pl" required className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-400 focus:border-green-500" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">Hasło</Label>
                    {/* ZABEZPIECZENIE: minLength={6} */}
                    <Input id="password" name="password" type="password" required minLength={6} className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-400 focus:border-green-500" />
                  </div>
                  {params?.message && (
                    <p className="text-red-500 text-sm font-bold text-center bg-red-900/20 p-2 rounded">{params.message}</p>
                  )}
                  <Button formAction={login} className="w-full bg-green-600 hover:bg-green-700 text-black font-bold mt-2">
                    Wchodzę w to
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* --- ZAKŁADKA REJESTRACJI --- */}
            <TabsContent value="register">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-white">Nazwa Użytkownika (Nick)</Label>
                    <Input id="fullName" name="fullName" type="text" placeholder="Np. SztywnyGit" required className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-400 focus:border-green-500" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="twoj@email.com" required className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-400 focus:border-green-500" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">Hasło</Label>
                    {/* ZABEZPIECZENIE: minLength={6} */}
                    <Input id="password" name="password" type="password" required minLength={6} placeholder="Minimum 6 znaków" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-400 focus:border-green-500" />
                  </div>
                  <Button formAction={signup} className="w-full bg-white hover:bg-gray-200 text-black font-bold mt-2">
                    Dołącz do ekipy (Odbierz 1000 pkt)
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-xs text-gray-500 flex justify-center">
            Logując się akceptujesz "Klauzulę Liścia" [Reg. §7].
        </CardFooter>
      </Card>
    </div>
  )
}