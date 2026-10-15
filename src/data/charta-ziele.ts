/** Die 79 Ziele der Charta 2040, sortiert in sechs Themen. Originaltexte aus dem PDF folgen. */

export type Ziel = { n: number; title: string; text: string; original?: string };

export type Thema = {
  id: string;
  nav: string;
  title: string;
  sub: string;
  intro: string;
  kpi: { value: string; text: string };
  tone: "blue" | "green" | "yellow" | "purple" | "coral" | "dark";
  forum: string;
  ziele: Ziel[];
};

export const themen: Thema[] = [
  {
    id: "mobilitaet",
    nav: "Mobilität & Digitales",
    title: "Mobilität & Digitales",
    sub: "Schneller hin, smarter da.",
    intro:
      "Unterwegs sein soll in der City West einfach, sauber und schnell sein. Bus und Bahn sind das Rückgrat, die Straßen gehören wieder mehr den Menschen zu Fuß und auf dem Rad.",
    kpi: { value: "10 %", text: "Nur noch so viele Wege sollen mit dem eigenen Auto gemacht werden." },
    tone: "blue",
    forum: "/forum?thema=mobilitaet",
    ziele: [
      { n: 1, title: "Mehr Fuß, Bus und Rad", text: "35 % der Wege zu Fuß, 30 % mit Bus und Bahn, 25 % mit Rad oder Roller. Nur noch 10 % mit dem eigenen Auto." },
      { n: 2, title: "Weniger Autoverkehr", text: "Eine City-Maut regelt die Zufahrt. Ku’damm, Tauentzien, Kaiserdamm und Kantstraße werden ruhiger, in Seitenstraßen entstehen autofreie Bereiche. Der Verkehr sinkt im Schnitt um 40 %." },
      { n: 3, title: "Bus alle 3 Minuten", text: "U-Bahn und emissionsfreie Busse werden stark ausgebaut. Werktags fährt auf den Hauptstrecken tagsüber alle drei Minuten ein Bus." },
      { n: 4, title: "Halb so viele Parkplätze", text: "Autos parken gesammelt in Quartiersgaragen. Die Hälfte der Parkplätze in den Seitenstraßen wird frei für Fuß- und Radverkehr." },
      { n: 5, title: "30.000 Fahrradstellplätze", text: "Bessere Radwege, sichere Übergänge und rund 30.000 Stellplätze an wichtigen Haltestellen." },
      { n: 7, title: "Lieferungen über Umschlagplätze", text: "Waren kommen über Hubs, etwa am ICC, am Hardenbergplatz, am S-Bahnhof Jungfernheide und am Adenauerplatz. Elektrische Shuttles verteilen sie weiter. Der Lkw-Verkehr sinkt um 20 %." },
      { n: 8, title: "Platz für Drohnen", text: "Große Neubauten (ab 5.000 m²) prüfen einen Landeplatz für Lieferdrohnen und regeln ihre Anlieferung auf dem eigenen Grundstück." },
      { n: 28, title: "Vorreiter beim Mobilfunk", text: "Laternen und Schilder tragen kleine Funkzellen, damit das 5G-Netz überall schnell ist." },
      { n: 29, title: "Daten für bessere Entscheidungen", text: "Daten aus Gebäuden, Umwelt und Verkehr helfen, Energie zu sparen und Plätze besser zu nutzen." },
      { n: 30, title: "Schnelles Internet für alle", text: "Das Glasfasernetz ist so stark, dass Homeoffice auch zu Stoßzeiten klappt." },
      { n: 31, title: "Offene Stadtdaten", text: "Eine Plattform des Bezirks zeigt Daten wie Lärm, Verkehr und Luftqualität. Für alle einsehbar." },
      { n: 32, title: "Die City West als 3D-Modell", text: "Ein digitaler Zwilling bildet alle Gebäude ab und ist mit aktuellen Daten verknüpft. Verwaltet vom Bezirk." },
      { n: 33, title: "Shoppen vom Sofa", text: "Die digitale City West ist online begehbar, inklusive Schaufensterbummel auf dem Ku’damm." },
      { n: 34, title: "Mehr sehen mit dem Handy", text: "Über Augmented Reality erscheinen Kunst, Geschichte und Angebote direkt im Stadtbild." },
      { n: 35, title: "Neubauten denken digital", text: "Wer bauen will, legt einen Plan vor, wie das Gebäude digital angebunden wird." },
      { n: 36, title: "Testfeld für neue Technik", text: "Living Labs am Campus Charlottenburg, KI-gesteuerte Ampeln, smarte Geschäftshäuser: Neues wird hier gemeinsam ausprobiert." },
      { n: 37, title: "Niemand wird abgehängt", text: "Die City West funktioniert auch ohne Smartphone, für alle." },
    ],
  },
  {
    id: "klima",
    nav: "Klima & Grün",
    title: "Klima & Grün",
    sub: "Mehr Grün, weniger Hitze.",
    intro:
      "Großstadt und Klimaschutz sind kein Widerspruch. Mit viel Grün, kluger Technik und sparsamem Bauen soll die City West zum Vorbild für andere Städte werden.",
    kpi: { value: "2040", text: "Dann ist die City West klimaneutral. Zehn Jahre vor dem Rest Berlins." },
    tone: "green",
    forum: "/forum?thema=klima",
    ziele: [
      { n: 11, title: "Regen bleibt vor Ort", text: "Regenwasser wird gespeichert und ins Grün geleitet. Wasserbecken kühlen die Stadt." },
      { n: 12, title: "Trinkwasser sparen", text: "Regenwasser und leicht verschmutztes Abwasser, etwa aus Duschen, werden für Bewässerung und Spülung genutzt." },
      { n: 13, title: "Lebensraum für Tiere", text: "Jedes Projekt schafft Platz für Natur: Nistkästen, Insektenhotels, begrünte Dächer, heimische Bäume." },
      { n: 14, title: "Klimaneutral bis 2040", text: "Zehn Jahre früher als ganz Berlin. Neue Gebäude sind ab sofort klimaneutral." },
      { n: 15, title: "Strom vom eigenen Dach", text: "Neubauten erzeugen mit Sonne und Wind mindestens 20 % ihres Stroms selbst." },
      { n: 16, title: "Bauen im Kreislauf", text: "Mindestens die Hälfte der Baustoffe ist recycelt, nachwachsend oder wiederverwendbar." },
      { n: 17, title: "Weniger Frischbeton", text: "Mehr als 30 % des Betons wird durch Recyclingbeton oder Alternativen wie Holz und Recyclingstahl ersetzt." },
      { n: 19, title: "Fassaden, die mehr können", text: "Glas wird vogelsicher, Fassaden schlucken Lärm." },
      { n: 20, title: "Grün gegen Hitze", text: "80 % der Dächer und 20 % der Fassaden werden begrünt, Flächen entsiegelt. Das kühlt im Sommer." },
      { n: 21, title: "Raum für Experimente", text: "Urban Farming, „Wald an der Wand“, neue Baustoffe: Neues wird hier zuerst ausprobiert." },
      { n: 23, title: "Reparieren statt wegwerfen", text: "Repair- und Tauschcafés, Foodsharing und Mehrweg werden am Ku’damm und an der Tauentzien gezielt angesiedelt." },
      { n: 26, title: "Saubere Events", text: "Als Messestandort setzt die City West auf Veranstaltungen ohne Einweg und mit weniger CO₂." },
      { n: 27, title: "Weniger Bauschutt", text: "Jeder Neubau plant vorab, wie viel Abfall entsteht. Gewerbeimmobilien können ihren Müll freiwillig messen." },
    ],
  },
  {
    id: "wohnen",
    nav: "Wohnen & Zusammenleben",
    title: "Wohnen & Zusammenleben",
    sub: "Platz für alle. Auch ohne dickes Konto.",
    intro:
      "In der City West ist Wohnen teuer. Damit hier trotzdem alle leben können, braucht es neue Wohnungen, bezahlbare Mieten und Orte, an denen man nichts kaufen muss.",
    kpi: { value: "20.000", text: "neue Wohnungen bis 2040." },
    tone: "yellow",
    forum: "/forum?thema=wohnen",
    ziele: [
      { n: 38, title: "Wohnen und Arbeiten unter einem Dach", text: "Gebäude und Etagen dürfen gemischt genutzt werden und bleiben flexibel." },
      { n: 39, title: "Orte der Begegnung", text: "Treffpunkte im Viertel werden gepflegt und erhalten." },
      { n: 40, title: "Ruhe gehört dazu", text: "Es gibt bewusst ruhige, private Bereiche als Rückzugsorte." },
      { n: 41, title: "Stadt ohne Kaufzwang", text: "Auch Menschen mit wenig Geld sollen hier leben und die Stadt genießen können, mit Orten und Veranstaltungen ohne Konsumzwang." },
      { n: 42, title: "Neubau zahlt ein", text: "Neue Bauprojekte zahlen in einen Fonds für Sozialwohnungen." },
      { n: 43, title: "1.000 Wohnungen pro Jahr", text: "Bis 2040 entstehen so 20.000 neue Wohnungen. Apartments für Studierende und Senioren entlasten den Mietmarkt." },
      { n: 44, title: "Wohnen in den Seitenstraßen", text: "Mehr Wohnungen dort, dazu Projekte für ältere Menschen und für mehrere Generationen." },
      { n: 45, title: "Bezahlbare Mieten sichern", text: "Mindestens 6 % der Wohnungen bleiben mietpreisgebunden, dazu kommen rund 5.000 Wohnungen mit gedämpften Mieten." },
      { n: 46, title: "Für jeden die passende Wohnung", text: "Mietwohnung, Eigentum, Mikroapartment, Wohnen für Studierende, Mehrgenerationen- und Seniorenwohnen." },
      { n: 47, title: "Normale Mietwohnungen bleiben", text: "Mindestens 80 % sind klassische, unmöblierte Mietwohnungen, auch mit Platz für Familien." },
      { n: 48, title: "Apartments, wo es dicht ist", text: "15 % Apartments in den dicht bebauten Bereichen entlasten den Mietmarkt." },
      { n: 49, title: "Homeoffice mitgedacht", text: "Grundrisse lassen Platz zum Arbeiten zu Hause." },
      { n: 50, title: "Jede Wohnung mit Balkon", text: "Balkon, Terrasse oder Loggia für jede Wohnung." },
      { n: 57, title: "Räume ohne Kaufzwang", text: "In Erdgeschossen entstehen konsumfreie Räume für Austausch, Kunst und Kreativität, finanziert über Fonds." },
    ],
  },
  {
    id: "wirtschaft",
    nav: "Handel, Arbeit & Wissen",
    title: "Handel, Arbeit & Wissen",
    sub: "Shoppen, arbeiten, forschen.",
    intro:
      "Shoppen, essen, arbeiten, forschen: Die City West lebt von dieser Mischung. Künftig soll sie stärker auf Messe, Forschung und Bildung setzen.",
    kpi: { value: "2 Mio. m²", text: "zusätzliche Bürofläche sind möglich." },
    tone: "purple",
    forum: "/forum?thema=wirtschaft",
    ziele: [
      { n: 24, title: "Einkaufen mit Zukunft", text: "Am Ku’damm und an der Tauentzien erlebt man, wie lokal produziert wird, etwa im 3D-Druck, mit Materialien vom Campus Charlottenburg." },
      { n: 51, title: "Büros, wo man gut hinkommt", text: "Rund um Breitscheidplatz, Wittenbergplatz, Ku’damm, Ernst-Reuter-Platz und Messe/ICC sind bis zu zwei Millionen m² neue Bürofläche möglich." },
      { n: 52, title: "Messe, Forschung, Bildung", text: "Auf diese drei Stärken soll sich die Wirtschaft der City West ausrichten." },
      { n: 53, title: "Handel mit Plan", text: "Ladenflächen werden gezielt kuratiert, mitgesteuert von einer Gesellschaft aus Stadt und Privatwirtschaft." },
      { n: 54, title: "Mehr als Einkaufen", text: "Läden, Bars, Restaurants, Theater, Kinos, Museen und der Zoo machen die City West besonders." },
      { n: 55, title: "Fünf Stärken", text: "Gesundheits- und Klimaforschung, Bauwesen, Messe, Handel und Gastronomie, Kultur und Bildung." },
      { n: 56, title: "Lebendige Erdgeschosse", text: "An belebten Straßen gehört das Erdgeschoss dem öffentlichen Leben, der Kultur und vielfältigen Läden." },
      { n: 58, title: "Forschung am ICC", text: "Neben dem Uni-Campus entsteht am ICC ein zweiter Standort für Wissenschaft." },
      { n: 59, title: "Offene Hörsäle", text: "Bildungsangebote sind zeitweise für alle frei zugänglich." },
    ],
  },
  {
    id: "kultur",
    nav: "Kultur & Nachtleben",
    title: "Kultur & Nachtleben",
    sub: "Vom Staatsballett bis zum Club.",
    intro:
      "Die City West war mal das Zentrum des Berliner Nachtlebens. Daran will sie anknüpfen: mit Hochkultur, Clubs und allem dazwischen.",
    kpi: { value: "3 Kulturen", text: "ein Ort: Hoch-, Pop- und Subkultur." },
    tone: "coral",
    forum: "/forum?thema=kultur",
    ziele: [
      { n: 25, title: "Erlebnisse statt Konsum", text: "Theater, Museen, Galerien, Marathon, Stadtspaziergänge: Gutes Leben braucht nicht mehr Einkaufen." },
      { n: 60, title: "Ein neues Kulturzentrum", text: "Hochkultur, Pop, Subkultur und Kirchengemeinden an einem Ort." },
      { n: 61, title: "Räume ohne Plan", text: "Ungeplante Räume, die die Stadtgesellschaft selbst nutzen und gestalten kann." },
      { n: 62, title: "Clubs retten", text: "Die City West knüpft an Legenden wie „Dschungel“ und „Big Apple“ an und schützt die heutige Clubszene vor dem Clubsterben." },
      { n: 63, title: "Tanzen fördern", text: "Ein Fonds fördert Räume zum Tanzen in Erd- und Untergeschossen." },
      { n: 64, title: "Kreativmaschine Charlottenburg", text: "Das Staatsballett bekommt ein festes Zuhause, der Rest des Hauses wird zu Ateliers und Proberäumen." },
      { n: 65, title: "Bühne für die Festspiele", text: "Die dauerhafte Nutzung des Hauses der Berliner Festspiele stärkt Theater und Tanz im Bezirk." },
      { n: 66, title: "Plätze als Bühnen", text: "Plätze werden so gestaltet, dass dort auch Off-Kultur stattfinden kann, sogar mit Tribünen." },
      { n: 67, title: "Kunst im Shuttle", text: "Schon in den Shuttles gibt es Klang- und Kunstinstallationen." },
      { n: 68, title: "Kreativlabor von UdK und TU", text: "Kunst und Technik arbeiten zusammen, sichtbar in Pop-ups und Förderprogrammen für Gründer." },
    ],
  },
  {
    id: "staedtebau",
    nav: "Städtebau & Plätze",
    title: "Städtebau & Plätze",
    sub: "Wie die Stadt aussieht.",
    intro:
      "Die City West ist seit über 100 Jahren ein Stück Großstadt. Dieser Charakter soll bleiben und weiterwachsen: mit schönen Plätzen, lebendigen Fassaden und mehr Höhe statt Fläche.",
    kpi: { value: "50 %", text: "der Freiflächen stehen zeitweise für neue Ideen offen." },
    tone: "dark",
    forum: "/forum?thema=staedtebau",
    ziele: [
      { n: 6, title: "Plätze zum Bleiben", text: "Der Hardenbergplatz wird zum Eingangstor und verbindet Breitscheidplatz, Tauentzien und Ku’damm. Öffentliche Räume laden zum Flanieren ein." },
      { n: 9, title: "Stadt und Investoren zahlen gemeinsam", text: "Private Bauherren tragen rund 20 % der Kosten, um die öffentlichen Räume rund um ihr Projekt aufzuwerten." },
      { n: 10, title: "Stadt auf allen Etagen", text: "Dächer, Terrassen und Erdgeschosse sind öffentlich nutzbar, für Kultur, Sport und Freizeit." },
      { n: 18, title: "Hochhäuser ohne Sturm", text: "Für jedes Hochhaus wird geprüft, dass unten keine gefährlichen Fallwinde entstehen." },
      { n: 22, title: "Platz für Experimente", text: "Die Hälfte der Freiflächen steht zumindest zeitweise für neue Nutzungen offen." },
      { n: 69, title: "Stadt statt Speckgürtel", text: "Guter Städtebau holt Menschen zurück in die Stadt." },
      { n: 70, title: "Echte Großstadt", text: "Dicht, vielfältig und urban: Die City West bleibt Zentrum." },
      { n: 71, title: "Lieber hoch als breit", text: "Höher bauen, statt Grünflächen zu versiegeln. Die historische Bebauung bleibt geschützt." },
      { n: 72, title: "Gebäude, die mitwachsen", text: "Grundrisse lassen sich später anders nutzen." },
      { n: 73, title: "Der Stadtplatz ist zurück", text: "Bestehende Plätze werden gestärkt, neue entstehen." },
      { n: 74, title: "Schatten und Arkaden", text: "Arkaden und Verschattung schützen vor Hitze, Wind und Regen." },
      { n: 75, title: "Fassaden mit Charakter", text: "Abwechslungsreiche Fassaden mit Erkern und Vorsprüngen. Die unteren drei Etagen orientieren sich an historischen Vorbildern." },
      { n: 76, title: "Arkaden und Balkone fördern", text: "Die Gebühr für Arkaden, Balkone und Vorbauten über öffentlichem Grund fällt weg." },
      { n: 77, title: "Dächer ohne Technikkästen", text: "Auf Dächer kommen nur Anlagen zur Energieerzeugung." },
      { n: 78, title: "Bauausstellung für Hochhäuser", text: "Eine Internationale Bauausstellung (IBA) soll zeigen, wie gute Hochhäuser aussehen." },
      { n: 79, title: "Schönheit als Maßstab", text: "Jeder Neubau soll mehr sein als nur zweckmäßig: schön und harmonisch." },
    ],
  },
];
