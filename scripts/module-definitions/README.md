# NetCoreOps module generator

Generator tworzy powtarzalny modul CRUD na podstawie jednego pliku JSON:

- migracje SQL w `server/db/migrations`
- Drizzle table w `server/db/generated`
- Zod validation w `server/utils/generated`
- endpointy Nuxt/Nitro CRUD w `server/api`
- strone Vue/Nuxt UI w `app/pages`

Uruchomienie:

```bash
rtk pnpm run generate:module scripts/module-definitions/example-helpdesk-tickets.json -- --dry-run
rtk pnpm run generate:module scripts/module-definitions/example-helpdesk-tickets.json
```

Opcje:

- `--dry-run` pokazuje liste plikow bez zapisu.
- `--force` pozwala nadpisac istniejace pliki.

Minimalny format:

```json
{
  "module": "helpdeskTickets",
  "title": "Zgloszenia",
  "tableName": "helpdesk_tickets",
  "route": "helpdesk/tickets",
  "timestamps": true,
  "fields": [
    { "name": "subject", "label": "Temat", "type": "varchar", "required": true, "max": 180 },
    { "name": "status", "label": "Status", "type": "enum", "values": ["OPEN", "CLOSED"], "default": "OPEN" }
  ]
}
```

Obslugiwane typy pol: `uuid`, `text`, `varchar`, `integer`, `number`, `boolean`, `timestamp`, `date`, `json`, `enum`.

Uwagi:

- `module` musi byc camelCase.
- `tableName` musi byc snake_case.
- `route` musi byc bezpieczna sciezka kebab-case, np. `helpdesk/tickets`.
- Akcje rekordow na wygenerowanej stronie sa dostepne przez menu kontekstowe prawym przyciskiem myszy.
- Generator tworzy pliki aplikacji, ale nie odpala migracji automatycznie. Po sprawdzeniu plikow uruchom migracje standardowym lokalnym przeplywem projektu.
