# Example Build tickets (house style reference)

These are real tickets from the Arenametrix Build project. Use them to calibrate naming
conventions and tone — real component/page names, plain-language descriptions of
behavior, references to repos (walnut/tigerlily). Note: these three examples are longer
and more exhaustive than the current target format (see SKILL.md's CONTEXT / EXPECTED
BEHAVIOR / REQUIREMENTS structure) — the team has since decided tickets should be much
shorter. Use them for voice, not for length or section structure. A concise example in
the current format is at the bottom of this file.

## Example 1 — feature wiring with UI flow + multi-language copy

CONTEXT
The Add to Lists / Remove from lists CTAs exists and handles both add and remove modes.
It needs to be wired up from the OptionsMenu (bulk action on selected contacts) in the ContactsPage :

EXPECTED ACTIONS
In OptionsMenu, add two items: "Add to a list" and "Remove from a list"
Both are visible only when at least one contact is selected
The webservice will work as a BULK action
Each opens a modal with selectedContactIds filled from the current selection

Step 1 = Choose the lists
1) The search bar GET all STATIC lists of the tenant, and display all possibilities in a dropdown component
2) When clicking on one list, the selected list is displayed as a badge inside the "SELECTED LISTS" section, with a cross icon to remove the selected option
3) Others lists can be added
4) Click on "Next" primary button or "Cancel" tertiary button

Step 2 = Confirm the selection
1) That confirmation page is following our current confirmation steps to avoid any wrong manipulations from our users:
Warning text =

LANGUAGE | WARNING TEXT
ENG 🏴 | You are about to add the selected contact(s) to one or more lists. This action cannot be undone. Be careful not to repeat this action too many times successively.
FR 🇫🇷 | Vous êtes sur le point d'ajouter le ou les contacts sélectionnés à une ou plusieurs listes. Cette action ne peut pas être annulée. Veillez à ne pas répéter cette action trop souvent d'affilée.
IT 🇮🇹 | Stai per aggiungere i contatti selezionati a una o più liste. Questa operazione non può essere annullata. Fai attenzione a non ripetere questa operazione troppe volte di seguito.
ESP 🇪🇸 | Estás a punto de añadir los contactos seleccionados a una o varias listas. Esta acción no se puede deshacer. Ten cuidado de no repetir esta acción demasiadas veces seguidas.
PORT 🇵🇹 | Está prestes a adicionar o(s) contacto(s) selecionado(s) a uma ou mais listas. Esta ação não pode ser desfeita. Tenha cuidado para não repetir esta ação demasiadas vezes seguidas.
NETH 🇳🇱 | U staat op het punt de geselecteerde contactpersoon(en) aan een of meer lijsten toe te voegen. Deze handeling kan niet ongedaan worden gemaakt. Let erop dat u deze handeling niet te vaak achter elkaar uitvoert.
ALL 🇩🇪 | Sie sind dabei, den/die ausgewählten Kontakt(e) zu einer oder mehreren Listen hinzuzufügen. Dieser Vorgang kann nicht rückgängig gemacht werden. Achten Sie darauf, diesen Vorgang nicht zu oft hintereinander zu wiederholen.

2) Display the number of contacts that are currently selected
3) Display the lists names in a badge that will receive contacts / or get contacts removed
4) Add a small component to validate the number of selected contacts:
Enter {selectedContacts} to confirm
Validate that the number entered is exactly the same as the one expected

Step 3 = validation modal
Display the confirmation modal when the back response is ok (200)

## Example 2 — backend/webservice ticket, flat action list

CONTEXT
In the front of the Contacts page, a quick search input exist to search easily some contacts:

The quick search helps our users to search contacts on:
* email
* lastname
* firstname

EXPECTED ACTIONS
1) Create the webservice to search contacts on:
* email
* lastname
* firstname

Job-to-be-done: I want to retrieve a contact called "Maxence" (firstname OR lastname OR email) as a "CONTAIN" (not perfect match)

2) The query starts only after a minimum of 3 characters as input (to limit recalculation at each new character) and you can take a look at any additional UX to limit endless search (the query starts a couple a seconds after last input provided?)

3) Return the contacts that match the input

4) Return an error if the process failed

## Example 3 — new page build, component-by-component breakdown, with EPIC links

CONTEXT

* EPIC : [BUILD - CRM - Segmentation engine - Lot 0](https://arenametrix-company.monday.com/boards/1910997639/pulses/2779652875)
* Following this ticket: https://arenametrix-company.monday.com/boards/1910997634/pulses/2779700546

Create the new page Contacts V3: /#/contacts

EXPECTED ACTIONS

Overall view of the page

Components

PageHeader Displays the page title, total contact count, and two action buttons:
* "Filter my contacts" (opens the builder panel)
* "Add a contact" (opens the creation sidebar)

List of fields for the creation sidebar = same as the current one for now

Toolbar Row above the table.
* Left: "Configure columns".
* Right:
   * "Options" dropdown (export, add to list, delete…) — disabled when no rows are selected
   * Quick search field filtering client-side on first name / last name / email.

ContactsTable Paginated table.
* Columns:
   * checkbox
   * default fields = Last name, First name, Email, Age, Structure, Postal code, Country, + "view profile" icon.
* Sortable column headers
* 10 rows per page with page number navigation.

CreateContactSidebar Right-side drawer. Contact creation form with collapsible accordion sections:
* Information
* Coordinates
* Lists
* Consents
* "Cancel" and "Save" buttons in the footer.

## Example 4 — concise example in the current (target) format

# Merge prompt on duplicate contact email (tigerlily)

## CONTEXT
Right now, adding a contact with an email that already exists on another contact just
creates a second record — there's no duplicate check. This ticket wires contact creation
to the new duplicate-detection webservice (see "Duplicate-email detection service"
ticket) so users get a merge prompt instead of a silent duplicate.

## EXPECTED BEHAVIOR
```
user submits new contact → email matches an existing contact?
  → yes → show merge prompt (existing contact info + Merge / Create anyway / Cancel)
  → no  → contact created normally
```
If the user picks "Merge," hand off to the existing contact's profile in edit mode. If
they pick "Create anyway," proceed with contact creation as today.

## REQUIREMENTS
- Call the duplicate-check webservice on submit, before creating the contact.
- Show the merge prompt modal when a match is returned; include the existing contact's
  name and email so the user can recognize it.
- "Create anyway" bypasses the check for that submission only.
- Copy needed: "A contact with this email already exists. Merge with it, or create a new one anyway?" (EN only for now — translations to follow separately).

Note what this example does *not* do: it never says "the modal already exists as a
prototype" or "this is currently simulated" — it just describes the merge flow and the
webservice call as plain expected behavior, even though that phrasing was informed by
looking at real (prototype) code.
