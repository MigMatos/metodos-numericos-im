import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import type { MethodConfig } from "@/lib/numerical/methods-config"

type MethodFormProps = {
  config: MethodConfig
  values: Record<string, string>
  errorMessage: string
  onChange: (key: string, value: string) => void
  onCalculate: () => void
  onReset: () => void
}

export function MethodForm({
  config,
  values,
  errorMessage,
  onChange,
  onCalculate,
  onReset,
}: MethodFormProps) {
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onCalculate()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.inputs.map((input) => {
          const inputId = `input-${config.id}-${input.key}`
          const hintId = `${inputId}-hint`

          return (
            <div key={input.key} className="flex flex-col gap-2">
              <Label htmlFor={inputId}>{input.label}</Label>
              <Input
                id={inputId}
                name={input.key}
                value={values[input.key] ?? ""}
                placeholder={input.placeholder}
                inputMode={input.kind === "number" ? "decimal" : "text"}
                autoComplete="off"
                spellCheck={false}
                aria-describedby={hintId}
                onChange={(event) => onChange(input.key, event.target.value)}
              />
              <p id={hintId} className="text-xs text-muted-foreground">
                {input.hint}
              </p>
            </div>
          )
        })}
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo calcular</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" className="h-9 px-6 tracking-[0.12em]">
          CALCULAR
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-9 px-5 tracking-[0.12em]"
          onClick={onReset}
        >
          RESTABLECER
        </Button>
      </div>
    </form>
  )
}
