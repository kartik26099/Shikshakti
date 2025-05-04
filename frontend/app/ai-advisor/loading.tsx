import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="relative">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl h-[500px] rounded-xl bg-white/5 dark:bg-slate-900/20 backdrop-blur-md p-6">
              <div className="space-y-6">
                <Skeleton className="h-16 w-3/4" />
                <div className="flex justify-end">
                  <Skeleton className="h-16 w-1/2" />
                </div>
                <Skeleton className="h-16 w-3/4" />
              </div>
            </div>

            <div className="mt-4 w-full max-w-4xl flex items-center space-x-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
