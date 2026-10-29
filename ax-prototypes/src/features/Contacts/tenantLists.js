/* Every list in the tenant (prototype data), shared by the contact record's
   Lists drawer and the contact creation drawer. `dynamic` lists are rules a
   contact matches or not; only `static` ones can be joined by hand. */
export const TENANT_LISTS = [
  { id: 4837, name: "Loyal audience", type: "dynamic", count: 12480, folder: "Loyalty & VIP" },
  { id: 4874, name: "Loyal fans", type: "dynamic", count: 8340, folder: "Loyalty & VIP" },
  { id: 4911, name: "Patrons circle", type: "static", count: 96, folder: "Loyalty & VIP" },
  { id: 4948, name: "VIP evening — June", type: "static", count: 180, folder: "Events" },
  { id: 4985, name: "Season launch guest list", type: "static", count: 220, folder: "Events" },
  { id: 5022, name: "Last-minute ticket buyers for the RCT v UBB match", type: "static", count: 1240, folder: "Events" },
  { id: 5059, name: "Senior segment", type: "dynamic", count: 5120, folder: "Audiences" },
  { id: 5096, name: "Student segment (under 26)", type: "dynamic", count: 3765, folder: "Audiences" },
  { id: 5133, name: "Public around", type: "dynamic", count: 21030, folder: "Audiences" },
  { id: 5170, name: "Public proche", type: "dynamic", count: 18940, folder: "Audiences" },
  { id: 5207, name: "Schools programme", type: "static", count: 1870, folder: "Audiences" },
  { id: 5244, name: "Yesterday's buyers", type: "dynamic", count: 412, folder: "Sales" },
  { id: 5281, name: "List of yesterday's buyers", type: "static", count: 386, folder: "Sales" },
  { id: 5318, name: "Press and partners", type: "static", count: 145, folder: "Campaigns" },
  { id: 5355, name: "Newsletter — manual additions", type: "static", count: 640, folder: "Campaigns" },
];
