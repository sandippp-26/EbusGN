import type { AppLanguage, IssueType, OperatorPriority } from './transitUtils.ts';

export interface PublicDictionary {
  seoTitle: string;
  seoDescription: string;
  brandTitle: string;
  navHome: string;
  navRoutes: string;
  navStops: string;
  navInfo: string;
  switchLanguageLabel: string;
  switchLanguageTarget: string;
  timeFormat12h: string;
  timeFormat24h: string;
  timeFormatAriaLabel: string;

  heroTagline: string;
  heroHeading: string;
  heroSubheading: string;
  fromLabel: string;
  fromPlaceholder: string;
  toLabel: string;
  toPlaceholder: string;
  swapStopsAria: string;
  clearInputAria: string;
  noMatchingStopsDropdown: string;
  searchBusButton: string;
  clearSearchButton: string;

  quickBrowseRoutesTitle: string;
  quickBrowseRoutesDesc: string;
  quickBrowseStopsTitle: string;
  quickBrowseStopsDesc: string;

  priorityFilterHeading: string;
  priorityAll: string;
  priorityP0: string;
  priorityP1: string;
  priorityP2: string;
  priorityTagP0: string;
  priorityTagP1: string;
  priorityTagP2: string;

  timeWindowHeading: string;
  currentTimeLabel: string;
  timeWindowNext2h: string;
  timeWindowNext3h: string;
  timeWindowNext4h: string;
  timeWindowAllToday: string;
  emptyWindowMatches: string;

  searchResultsHeading: string;
  routesPageTitle: string;
  routesPageSubtitle: string;
  routesSearchPlaceholder: string;
  stopsPageTitle: string;
  stopsPageSubtitle: string;
  stopsSearchPlaceholder: string;

  loadingMessage: string;
  emptyVerifiedDataTitle: string;
  emptyVerifiedDataDesc: string;
  emptyConnectionPendingDesc: string;
  emptySearchMatches: string;

  firstBusLabel: string;
  lastBusLabel: string;
  nextBusLabel: string;
  upcomingTimesLabel: string;
  serviceCompletedToday: string;
  tomorrowFirstBusLabel: string;
  matchingDeparturesSingular: string;
  matchingDeparturesPlural: string;
  timetableUnavailable: string;
  statusVerified: string;
  statusPartiallyVerified: string;
  statusConflicting: string;
  statusUnverified: string;
  viewDetailsLabel: string;

  backToRoutes: string;
  backToStops: string;
  routeDirectionLabel: string;
  lastUpdatedLabel: string;
  lastUpdatedUnavailable: string;
  intermediateStopsTitle: string;
  noStopsRecorded: string;
  scheduledDeparturesTitle: string;
  departureTimeCol: string;
  departureDirectionCol: string;
  departureNotesCol: string;
  dataSourceLabel: string;
  dataSourceUnavailable: string;
  verificationNoteTitle: string;
  verificationNoteVerified: string;
  verificationNoteCaution: string;

  stopAreaLabel: string;
  stopLandmarkLabel: string;
  busesThroughStopTitle: string;
  noRoutesForStop: string;

  infoPageTitle: string;
  infoPageSubtitle: string;
  aboutSectionTitle: string;
  aboutPublisherLine: string;
  aboutScopeBody: string;
  dataSourcesSectionTitle: string;
  noDataSourcesListed: string;
  dpdpSectionTitle: string;
  dpdpBody1: string;
  dpdpBody2: string;
  complaintSectionTitle: string;
  complaintSectionSubtitle: string;
  complaintNoticeBeforeSubmit: string;
  issueTypeLabel: string;
  issueWrongRoute: string;
  issueWrongStop: string;
  issueWrongTiming: string;
  issueOther: string;
  routeOrStopInputLabel: string;
  routeOrStopInputPlaceholder: string;
  problemDescLabel: string;
  problemDescPlaceholder: string;
  submitComplaintButton: string;
  submittingComplaintButton: string;
  cooldownActivePrefix: string;
  cooldownActiveSuffix: string;
  complaintSuccessTitle: string;
  complaintRefLabel: string;
  complaintPendingReviewNote: string;
  complaintValidationError: string;
  complaintServerError: string;

  footerText: string;
}

export const PUBLIC_I18N: Record<AppLanguage, PublicDictionary> = {
  gu: {
    seoTitle: 'ગાંધીનગર બસ — જાહેર બસ રૂટ, સ્ટોપ અને સમયપત્રક',
    seoDescription:
      'ગાંધીનગરમાં જાહેર બસ રૂટ, બસ સ્ટોપ, ઓપરેટર અને સમયપત્રકની ચકાસાયેલી માહિતી મેળવો.',
    brandTitle: 'ગાંધીનગર બસ',
    navHome: 'હોમ',
    navRoutes: 'રૂટ્સ',
    navStops: 'સ્ટોપ્સ',
    navInfo: 'માહિતી',
    switchLanguageLabel: 'ભાષા બદલો',
    switchLanguageTarget: 'અંગ્રેજી',
    timeFormat12h: '૧૨ કલાક',
    timeFormat24h: '૨૪ કલાક',
    timeFormatAriaLabel: 'સમય ફોર્મેટ બદલો',

    heroTagline: 'ફક્ત જાહેર બસ માહિતી · કોઈ બુકિંગ અથવા પેમેન્ટ નથી',
    heroHeading: 'ગાંધીનગરમાં સીધી બસ શોધો',
    heroSubheading:
      'તમારા ઉપડવાના અને પહોંચવાના સ્થળ વચ્ચેના ઉપલબ્ધ બસ રૂટ, સ્ટોપ અને નિયત સમય જુઓ.',
    fromLabel: 'ક્યાંથી (ઉપડવાનું સ્થળ)',
    fromPlaceholder: 'સ્ટોપ શોધો અથવા પસંદ કરો...',
    toLabel: 'ક્યાં સુધી (પહોંચવાનું સ્થળ)',
    toPlaceholder: 'સ્ટોપ શોધો અથવા પસંદ કરો...',
    swapStopsAria: 'ઉપડવાનું અને પહોંચવાનું સ્થળ અદલાબદલી કરો',
    clearInputAria: 'લખાણ સાફ કરો',
    noMatchingStopsDropdown: 'આ નામનો કોઈ ચકાસેલો સ્ટોપ મળ્યો નથી',
    searchBusButton: 'બસ શોધો',
    clearSearchButton: 'શોધ સાફ કરો',

    quickBrowseRoutesTitle: 'તમામ બસ રૂટ્સ જુઓ',
    quickBrowseRoutesDesc: 'ઓપરેટર મુજબ રૂટ કોડ, પ્રથમ અને છેલ્લી બસનો સમય તપાસો.',
    quickBrowseStopsTitle: 'તમામ બસ સ્ટોપ્સ જુઓ',
    quickBrowseStopsDesc: 'કોઈપણ સ્ટોપ પરથી પસાર થતી તમામ બસોની યાદી જુઓ.',

    priorityFilterHeading: 'બસ સેવા મુજબ ફિલ્ટર કરો',
    priorityAll: 'તમામ સેવાઓ',
    priorityP0: 'ગાંધીનગર ગ્રીન સિટી બસ',
    priorityP1: 'એએમટીએસ · બીઆરટીએસ · એસટી',
    priorityP2: 'ગિફ્ટ ફીડર અને લોકલ બસ',
    priorityTagP0: 'પ્રાથમિક',
    priorityTagP1: 'શહેરી અને એસટી',
    priorityTagP2: 'ફીડર અને લોકલ',

    timeWindowHeading: 'સમય મુજબ ઝડપી ફિલ્ટર',
    currentTimeLabel: 'અત્યારનો સમય',
    timeWindowNext2h: 'આગામી 2 કલાક',
    timeWindowNext3h: 'આગામી 3 કલાક',
    timeWindowNext4h: 'આગામી 4 કલાક',
    timeWindowAllToday: 'આજની બધી બસો',
    emptyWindowMatches: 'પસંદ કરેલા સમયગાળામાં કોઈ નિયત બસ ઉપડતી નથી.',

    searchResultsHeading: 'સીધી બસ શોધના પરિણામો',
    routesPageTitle: 'ગાંધીનગર બસ રૂટ્સ',
    routesPageSubtitle: 'ચકાસાયેલા જાહેર બસ રૂટ્સ અને ઓપરેટર વિગતો.',
    routesSearchPlaceholder: 'રૂટ નંબર, સ્થળ અથવા ઓપરેટર શોધો...',
    stopsPageTitle: 'બસ સ્ટોપ્સની યાદી',
    stopsPageSubtitle: 'સ્ટોપ પર ક્લિક કરીને ત્યાંથી મળતી બસો જુઓ.',
    stopsSearchPlaceholder: 'બસ સ્ટોપ અથવા વિસ્તારનું નામ લખો...',

    loadingMessage: 'માહિતી લોડ થઈ રહી છે...',
    emptyVerifiedDataTitle: 'હાલમાં ચકાસેલી માહિતી ઉપલબ્ધ નથી',
    emptyVerifiedDataDesc:
      'ડેટાબેઝમાં હાલ કોઈ ચકાસાયેલા જાહેર બસ રૂટ કે સ્ટોપ ઉપલબ્ધ નથી. ખોટા કે અનુમાનિત સમય અહીં દર્શાવવામાં આવતા નથી.',
    emptyConnectionPendingDesc:
      'સુરક્ષિત ડેટાબેઝ કનેક્શન ઉપલબ્ધ થતાની સાથે જ અહીં ચકાસાયેલા બસ રૂટ અને સમયપત્રક દેખાશે.',
    emptySearchMatches: 'તમારી શોધ મુજબ હાલ કોઈ સીધો બસ રૂટ મળ્યો નથી.',

    firstBusLabel: 'પ્રથમ બસ',
    lastBusLabel: 'છેલ્લી બસ',
    nextBusLabel: 'આગામી બસ',
    upcomingTimesLabel: 'પછીની બસો',
    serviceCompletedToday: 'આજની સેવા પૂર્ણ',
    tomorrowFirstBusLabel: 'આવતીકાલની પ્રથમ બસ',
    matchingDeparturesSingular: 'બસ ઉપડશે',
    matchingDeparturesPlural: 'બસો ઉપડશે',
    timetableUnavailable: 'સમયની માહિતી ઉપલબ્ધ નથી',
    statusVerified: 'ચકાસાયેલ',
    statusPartiallyVerified: 'આંશિક ચકાસાયેલ',
    statusConflicting: 'વિરોધાભાસી',
    statusUnverified: 'અચકાસાયેલ',
    viewDetailsLabel: 'વિગત જુઓ',

    backToRoutes: 'બધા રૂટ્સ પર પાછા જાઓ',
    backToStops: 'બધા સ્ટોપ્સ પર પાછા જાઓ',
    routeDirectionLabel: 'દિશા',
    lastUpdatedLabel: 'છેલ્લું અપડેટ',
    lastUpdatedUnavailable: 'તારીખ ઉપલબ્ધ નથી',
    intermediateStopsTitle: 'રૂટના તમામ બસ સ્ટોપ્સ (ક્રમ મુજબ)',
    noStopsRecorded: 'આ રૂટ માટે સ્ટોપની ક્રમવાર યાદી હાલ ઉપલબ્ધ નથી.',
    scheduledDeparturesTitle: 'નિયત ઉપડવાનો સમયપત્રક',
    departureTimeCol: 'ઉપડવાનો સમય',
    departureDirectionCol: 'દિશા',
    departureNotesCol: 'નોંધ / આવૃત્તિ',
    dataSourceLabel: 'માહિતીનો સ્ત્રોત',
    dataSourceUnavailable: 'જાહેર સ્ત્રોત નોંધાયેલ નથી',
    verificationNoteTitle: 'માહિતી ચકાસણી સ્થિતિ',
    verificationNoteVerified: 'આ રૂટની વિગતો જાહેર વપરાશ માટે ચકાસાયેલી છે.',
    verificationNoteCaution: 'આ માહિતી પૂર્ણ રીતે ચકાસાયેલી નથી; મુસાફરી પહેલાં સ્થાનિક સ્ટોપ પર ખાતરી કરો.',

    stopAreaLabel: 'વિસ્તાર',
    stopLandmarkLabel: 'નજીકની ઓળખ',
    busesThroughStopTitle: 'આ સ્ટોપ પરથી પસાર થતી બસો',
    noRoutesForStop: 'હાલમાં આ સ્ટોપ માટે કોઈ ચકાસાયેલ રૂટ નોંધાયેલ નથી.',

    infoPageTitle: 'પોર્ટલ વિશે, ગોપનીયતા અને ફરિયાદ',
    infoPageSubtitle: 'ગાંધીનગર બસ જાહેર માહિતી પ્લેટફોર્મની નીતિઓ અને ભૂલ સુધારણા વિનંતી.',
    aboutSectionTitle: 'ગાંધીનગર બસ વિશે',
    aboutPublisherLine: 'સ્ટાર કિંગ નેટવર્ક દ્વારા સંચાલિત મફત જાહેર માહિતી સેવા.',
    aboutScopeBody:
      'આ પ્લેટફોર્મ માત્ર જાહેર બસ રૂટ, સ્ટોપ, ઓપરેટર અને સમયપત્રકની માહિતી આપવા માટે છે. અહીં ટિકિટ બુકિંગ, સીટ રિઝર્વેશન, ઓનલાઇન પેમેન્ટ કે લાઇવ જીપીએસ ટ્રેકિંગની સુવિધા નથી.',
    dataSourcesSectionTitle: 'માહિતીના સ્ત્રોતો',
    noDataSourcesListed: 'હાલમાં કોઈ જાહેર ડેટા સ્ત્રોત ઉપલબ્ધ નથી.',
    dpdpSectionTitle: 'ગોપનીયતા સૂચના (ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન નિયમ મુજબ)',
    dpdpBody1:
      'આ વેબસાઇટ વાપરવા માટે કોઈ લૉગિન, નામ કે મોબાઇલ નંબર જરૂરી નથી. અમે માત્ર ભાષા અને સમય ફોર્મેટની પસંદગી તમારા બ્રાઉઝરમાં સ્થાનિક રીતે સાચવીએ છીએ.',
    dpdpBody2:
      'જ્યારે તમે ખોટી માહિતી અંગે ફરિયાદ મોકલો છો, ત્યારે સ્પામ અટકાવવા માટે મર્યાદિત ટેકનિકલ વિગતો (જેમ કે દર મર્યાદા માટે આઇપી વિગત) સુરક્ષિત રીતે નોંધાય છે અને તે ક્યારેય જાહેર કરવામાં આવતી નથી.',
    complaintSectionTitle: 'ખોટી માહિતીની જાણ કરો / ફરિયાદ નોંધાવો',
    complaintSectionSubtitle:
      'જો કોઈ રૂટ, સ્ટોપ કે સમયપત્રકમાં ભૂલ જણાય તો નીચે વિગત મોકલો. નામ, ફોન નંબર કે ફોટો અપલોડ જરૂરી નથી.',
    complaintNoticeBeforeSubmit:
      'મહત્વપૂર્ણ: ફરિયાદ મોકલ્યા પછી જાહેર બસ ડેટા આપમેળે બદલાશે નહીં; એડમિન ચકાસણી પછી જ ફેરફાર થશે.',
    issueTypeLabel: 'સમસ્યાનો પ્રકાર',
    issueWrongRoute: 'ખોટો રૂટ',
    issueWrongStop: 'ખોટો સ્ટોપ',
    issueWrongTiming: 'ખોટો સમય',
    issueOther: 'અન્ય માહિતી',
    routeOrStopInputLabel: 'રૂટ નંબર અથવા બસ સ્ટોપનું નામ',
    routeOrStopInputPlaceholder: 'દા.ત. રૂટ ૧૦૧ અથવા સેક્ટર ૨૧ સ્ટોપ',
    problemDescLabel: 'સમસ્યાની વિગત',
    problemDescPlaceholder: 'કઈ માહિતી ખોટી છે અને સાચી વિગત શું હોવી જોઈએ તે ટૂંકમાં લખો...',
    submitComplaintButton: 'વિનંતી મોકલો',
    submittingComplaintButton: 'મોકલાઈ રહ્યું છે...',
    cooldownActivePrefix: 'નવી વિનંતી મોકલવા માટે કૃપા કરીને',
    cooldownActiveSuffix: 'સેકન્ડ રાહ જુઓ.',
    complaintSuccessTitle: 'તમારી જાણકારી સુરક્ષિત રીતે નોંધાઈ ગઈ છે',
    complaintRefLabel: 'ફરિયાદ સંદર્ભ નંબર',
    complaintPendingReviewNote:
      'તમારી વિગત એડમિન ચકાસણી માટે કતારમાં છે. ચકાસણી પૂર્ણ થયા પછી જ જાહેર માહિતી અપડેટ થશે.',
    complaintValidationError:
      'કૃપા કરીને રૂટ અથવા સ્ટોપનું નામ અને સમસ્યાની પૂરતી વિગત (ઓછામાં ઓછા ૧૦ અક્ષર) લખો.',
    complaintServerError: 'વિનંતી મોકલવામાં મુશ્કેલી આવી. થોડી વાર પછી ફરી પ્રયાસ કરો.',

    footerText: 'ગાંધીનગર બસ · સ્ટાર કિંગ નેટવર્ક · માત્ર જાહેર માહિતી માટે (બુકિંગ કે પેમેન્ટ સેવા નથી)',
  },
  en: {
    seoTitle: 'GANDHINAGAR BUS — Public Bus Routes, Stops & Timetables',
    seoDescription:
      'Find verified Gandhinagar public bus routes, bus stops, operators, and scheduled departure timings. Free information-only transit guide.',
    brandTitle: 'GANDHINAGAR BUS',
    navHome: 'Home',
    navRoutes: 'Routes',
    navStops: 'Stops',
    navInfo: 'Info',
    switchLanguageLabel: 'Switch Language',
    switchLanguageTarget: 'Gujarati',
    timeFormat12h: '12h',
    timeFormat24h: '24h',
    timeFormatAriaLabel: 'Toggle 12-hour or 24-hour time format',

    heroTagline: 'Information-Only Public Transit Guide · No Booking or Payments',
    heroHeading: 'Find Direct Buses in Gandhinagar',
    heroSubheading:
      'Search direct routes between your boarding and destination stops, check operators, and view scheduled departure timings.',
    fromLabel: 'From Stop',
    fromPlaceholder: 'Search or select boarding stop...',
    toLabel: 'To Stop',
    toPlaceholder: 'Search or select destination stop...',
    swapStopsAria: 'Swap origin and destination stops',
    clearInputAria: 'Clear input',
    noMatchingStopsDropdown: 'No matching verified stops found',
    searchBusButton: 'Search Bus',
    clearSearchButton: 'Clear Search',

    quickBrowseRoutesTitle: 'Browse All Routes',
    quickBrowseRoutesDesc: 'View route codes, operators, and first/last bus times.',
    quickBrowseStopsTitle: 'Browse All Stops',
    quickBrowseStopsDesc: 'Find every bus route serving a specific stop.',

    priorityFilterHeading: 'Filter by Bus Service',
    priorityAll: 'All Services',
    priorityP0: 'Gandhinagar Green City Bus (GGTSL / PM eBus)',
    priorityP1: 'AMTS / BRTS & GSRTC',
    priorityP2: 'GIFT Feeder & Local Buses',
    priorityTagP0: 'Primary',
    priorityTagP1: 'Metro & State',
    priorityTagP2: 'Feeder & Local',

    timeWindowHeading: 'Quick Time Filter',
    currentTimeLabel: 'Current time',
    timeWindowNext2h: 'Next 2 hrs',
    timeWindowNext3h: 'Next 3 hrs',
    timeWindowNext4h: 'Next 4 hrs',
    timeWindowAllToday: 'All today',
    emptyWindowMatches: 'No scheduled departures fall within the selected time window.',

    searchResultsHeading: 'Direct Bus Search Results',
    routesPageTitle: 'Gandhinagar Bus Routes',
    routesPageSubtitle: 'Browse public bus routes with service-type color coding and verification status.',
    routesSearchPlaceholder: 'Search route code, stop, or operator...',
    stopsPageTitle: 'Bus Stops Directory',
    stopsPageSubtitle: 'Select any stop to see all bus routes passing through it.',
    stopsSearchPlaceholder: 'Search bus stop or area name...',

    loadingMessage: 'Loading transit information...',
    emptyVerifiedDataTitle: 'No verified data available yet',
    emptyVerifiedDataDesc:
      'There are currently no verified public bus routes or stops returned from the database. Unverified or guessed timings are never displayed.',
    emptyConnectionPendingDesc:
      'Verified bus routes and timetables will appear here automatically once the public database connection is active.',
    emptySearchMatches: 'No direct bus routes matched your search.',

    firstBusLabel: 'First Bus',
    lastBusLabel: 'Last Bus',
    nextBusLabel: 'Next bus',
    upcomingTimesLabel: 'Upcoming',
    serviceCompletedToday: 'Service completed for today',
    tomorrowFirstBusLabel: "Tomorrow's first bus",
    matchingDeparturesSingular: 'departure in window',
    matchingDeparturesPlural: 'departures in window',
    timetableUnavailable: 'Timetable currently unavailable',
    statusVerified: 'Verified',
    statusPartiallyVerified: 'Partially Verified',
    statusConflicting: 'Conflicting',
    statusUnverified: 'Unverified',
    viewDetailsLabel: 'View Route',

    backToRoutes: 'Back to All Routes',
    backToStops: 'Back to All Stops',
    routeDirectionLabel: 'Direction',
    lastUpdatedLabel: 'Last Updated',
    lastUpdatedUnavailable: 'Not specified',
    intermediateStopsTitle: 'Route Stops (In Sequence)',
    noStopsRecorded: 'Stop sequence for this route is currently unavailable.',
    scheduledDeparturesTitle: 'Scheduled Departure Times',
    departureTimeCol: 'Departure Time',
    departureDirectionCol: 'Direction',
    departureNotesCol: 'Frequency / Notes',
    dataSourceLabel: 'Data Source',
    dataSourceUnavailable: 'Public source attribution unavailable',
    verificationNoteTitle: 'Verification Status',
    verificationNoteVerified: 'This route has been verified for public reference.',
    verificationNoteCaution: 'This record is not fully verified; confirm locally before travel.',

    stopAreaLabel: 'Area',
    stopLandmarkLabel: 'Landmark',
    busesThroughStopTitle: 'Buses Passing Through This Stop',
    noRoutesForStop: 'No verified routes are currently linked to this stop.',

    infoPageTitle: 'About, Privacy Notice & Report an Issue',
    infoPageSubtitle: 'Platform scope, DPDP privacy commitments, and public correction requests.',
    aboutSectionTitle: 'About GANDHINAGAR BUS',
    aboutPublisherLine: 'A free, information-only public service by STAR KING NETWORK.',
    aboutScopeBody:
      'GANDHINAGAR BUS provides public bus route, stop, operator, and scheduled departure information only. We do not offer ticket booking, seat reservations, online payments, driver hiring, or live GPS tracking.',
    dataSourcesSectionTitle: 'Data Sources',
    noDataSourcesListed: 'No public data sources are currently listed.',
    dpdpSectionTitle: 'DPDP Privacy Notice',
    dpdpBody1:
      'No user account, login, name, or phone number is required to browse GANDHINAGAR BUS. Only your language and 12h/24h time preferences are stored locally in your browser.',
    dpdpBody2:
      'When you submit an incorrect-info report below, technical metadata (such as rate-limit IP tracking) is processed strictly for spam prevention and is never published publicly.',
    complaintSectionTitle: 'Report Incorrect Info / Complaint Box',
    complaintSectionSubtitle:
      'Spot a wrong route, missing stop, or outdated timing? Submit a correction note below. No photo upload, name, or phone number is required.',
    complaintNoticeBeforeSubmit:
      'Important: Public bus data will NOT auto-change upon submission. All reports require Admin verification first.',
    issueTypeLabel: 'Issue Type',
    issueWrongRoute: 'Wrong Route',
    issueWrongStop: 'Wrong Stop',
    issueWrongTiming: 'Wrong Timing',
    issueOther: 'Other',
    routeOrStopInputLabel: 'Route / Stop Name',
    routeOrStopInputPlaceholder: 'e.g. Route 101 or Sector 21 Bus Stop',
    problemDescLabel: 'Problem Description',
    problemDescPlaceholder: 'Describe what is incorrect and what needs to be updated...',
    submitComplaintButton: 'Submit Report',
    submittingComplaintButton: 'Submitting...',
    cooldownActivePrefix: 'Please wait',
    cooldownActiveSuffix: 'seconds before submitting another report.',
    complaintSuccessTitle: 'Report Received for Admin Review',
    complaintRefLabel: 'Complaint Reference Number',
    complaintPendingReviewNote:
      'Public transit records will remain unchanged until verified by an Admin.',
    complaintValidationError:
      'Please enter a route or stop name and a description of at least 10 characters.',
    complaintServerError: 'Could not submit the report right now. Please try again shortly.',

    footerText: 'GANDHINAGAR BUS · STAR KING NETWORK · Information-Only Public Transit Portal',
  },
};

export function getOperatorPriorityLabel(
  priority: OperatorPriority,
  dict: PublicDictionary,
): string {
  switch (priority) {
    case 'P0':
      return dict.priorityTagP0;
    case 'P1':
      return dict.priorityTagP1;
    case 'P2':
    default:
      return dict.priorityTagP2;
  }
}

export function getIssueTypeLabel(issue: IssueType, dict: PublicDictionary): string {
  switch (issue) {
    case 'wrong_route':
      return dict.issueWrongRoute;
    case 'wrong_stop':
      return dict.issueWrongStop;
    case 'wrong_timing':
      return dict.issueWrongTiming;
    case 'other':
    default:
      return dict.issueOther;
  }
}
