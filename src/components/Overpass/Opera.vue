<script setup lang="ts">
import { ref, toRef, computed, watch } from "vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import L0Censimento from "../L0Censimento.vue";
import L1Ispezione from "../L1Ispezione.vue";
import L1Difettosita from "../L1Difettosita.vue";

import CASF from "../CASF.vue";
import CARS from "../CARS.vue";

import { Utils } from "../../service/Utils";
const u: any = new Utils();

//import { fsCrud } from "../../service/fb-service";
//const fsCrudHandle = new fsCrud();
//const fsCrudGruppi = new fsCrud("gruppi");
//const fsCrudOpere = new fsCrud("opere");
//const fsCrudSchede = new fsCrud("schede");
//const fsCrudAinop = new fsCrud("ainop");

// emit
const emit = defineEmits(["update:opera", "update:schede", "action"]);
//const emit = defineEmits([ "action"]);

// props
interface Props {
  // get scheda
  opera: any;
  schede: any[];
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  opera: () => {
    return {};
  },
  schede: () => {
    return [];
  },
  disabled: false,
});

// define model
/*
const opera = defineModel("opera", {
  default: {},
  required: true,
});
const schede = defineModel("schede", {
  default: [],
  required: true,
});
*/

// toRef
const opera = toRef(props, "opera");
const schede = toRef(props, "schede");
const disabled = toRef(props, "disabled");

// ref
//const tab = ref("0");
//const gruppi = ref<any[]>([]);
const scheda = ref();

watch(scheda, (n) => updateScheda(n), { deep: true });

// event > @update:modelValue
// emit to update indexDB
const updateScheda = (scheda: any = null) => {
  //console.log("Opera > updateScheda", scheda);
  if (scheda)
    emit("action", { action: "update", storeName: "schede", item: scheda });
};

//
//onMounted(() => (tab.value = "0"));
watch(opera, () => {
  //tab.value = "0";
  scheda.value = null;
});

//
const schedeL0L1opera = computed(() => {
  const L0L1: any[] =
    schede.value.length > 0
      ? schede.value.filter((x: any) => x.type === "L0" || x.type === "L1")
      : [];

  let obj: any = {};
  L0L1.map((x) => Object.assign(obj, x));

  return obj;
});

//
// proprietà geometriche dell'opera
// che vengono visualizzate
//
const keysOfGeometry = [
  //"AllegatiRelazioneCollaudo",
  "AltezzaMaxPile",
  "AltezzaPile",
  //"AnnoUltimazione",
  //"ApparecchiAssentiPresenti",
  //"AttivitaDiMonitoraggioPregresseOInCorso",
  //"AutoreDellaProgettazione",
  "CAPTravi",
  "CASoletta",
  "CATraversi",
  //"CentroLatitudine",
  //"CentroLongitudine",
  //"CentroQuotaSlm",
  //"ClasseDiConseguenza",
  //"ClassificazioneDelleVieDAttacco",
  //"ClassificazioniDUsoStradale",
  //"CodiceIOP",
  //"Comune",
  //"Concessionario",
  //"CoordinateGeografiche",
  //"DataApprovazione",
  //"DataApprovazioneEffettivoPresunto",
  //"DataFine",
  //"DataFineEffettivoPresunto",
  //"DataInizio",
  //"DataInizioEffettivoPresunto",
  //"DataIspezione",
  //"DocumentiContabiliDL",
  //"DocumentiContabiliRealizzazione",
  //"DocumentiContrattualiRealizzazione",
  //"DocumentiDescrittiviDefinitivoEsecutivo",
  //"DocumentiDescrittiviDiMassima",
  //"DocumentiDescrittiviEsecutivoCantierabile",
  //"DocumentiDescrittiviEsecutivoCantierabileAllegatoN",
  //"DocumentiDescrittiviEsecutivoCantierabileFonte",
  //"DocumentiGraficiDefinitivoEsecutivo",
  //"DocumentiGraficiDiMassima",
  //"DocumentiGraficiEsecutivoCantierabile",
  //"DocumentiGraficiEsecutivoCantierabileAllegatoN",
  //"DocumentiGraficiEsecutivoCantierabileFonte",
  //"DocumentiInerentiIterApprovazioneDefinitivoEsecutivo",
  //"DocumentiInerentiIterApprovazioneDiMassima",
  //"DocumentiInerentiIterApprovazioneEsecutivoCantierabile",
  //"ElementiAssentiPresenti",
  //"EnteVigilante",
  //"EvoluzioneEventualeRispettoAlFondoAlveo",
  //"FenomeniErosiviAlluvionamento",
  //"FenomeniFranosi",
  //"FinaleLatitudine",
  //"FinaleLongitudine",
  //"FinaleQuotaSlm",
  //"FondazioniSpallaFinale",
  //"FondazioniSpallaIniziale",
  "GeometriaSezione",
  //"GraficiAllegatiContabilitAppalto",
  "ImpalcatoCAP",
  "ImpalcatoMaterialeCostruttivo",
  "ImpalcatoTipologiaSoletta",
  //"InizialeLatitudine",
  //"InizialeLongitudine",
  //"InizialeQuotaSlm",
  //"InserimentoDelPonteNellAmbitoDeiPianiPaesaggisticiVigentiAdottati",
  //"InterventiDiManutenzione",
  //"InterventiEffettivoPresunto",
  //"IspezionatiEntrambiProspetti",
  //"IspezioniPregresse",
  //"ItinerarioInternazionale",
  "LarghezzaCareggiata",
  "LarghezzaImpalcato",
  "LarghezzaTotaleImpalcato",
  //"LimitazioneDiCarico",
  //"Localita",
  "LuceCampate",
  "LuceComplessivaEstesa",
  "LuceComplessivaSpallaSpalla",
  "LuceSingolaCampata",
  "LunghezzaGiuntoPila",
  "LunghezzaGiuntoSpalla",
  "LunghezzaSbalzoSoletta",
  //"MorfologiaDelSito",
  "NApparecchiRilevabili",
  "NApparecchiTot",
  "NCampate",
  "NCarreggiate",
  "NCorsieCarreggiata",
  "NElementitotaliSoletta",
  "NElementitotaliTraversi",
  "NElementitotaliTravi",
  "NomePonteViadotto",
  //"NormaDiProgetto",
  "NumeroFondazioni",
  "NumeroTotaleGiunti",
  //"PianiStrumentoProgrammazione",
  "PileCA",
  "PileMaterialeCostruttivo",
  //"PossibilitaDiAccedereAlDiSottoDelPonte",
  //"PresenzaAlternativeStradali",
  "PresenzaDiCurve",
  //"Progettista",
  "ProgressivaKm",
  "ProgressivaKmFinale",
  "ProgressivaKmIniziale",
  //"Proprietario",
  //"ProvinciaRegione",
  //"ProvvedimentiDiTutela",
  //"RelazioneDiCollaudo",
  //"Rischiofrane",
  //"Rischioidraulico",
  "SpalleCA",
  //"StatoDellOpera",
  //"StatoDiDegrado",
  //"StradaDiAppartenenza",
  //"StrumentiDelFinanziamento",
  //"TecnicoRilevatore",
  //"TipoDiApparecchi",
  //"TipoDiCollegamento",
  //"TipoSistemiDiProtezione",
  //"TipologiaApparecchiAppoggio",
  "TipologiaDiElemento",
  "TipologiaDispositiviAntisismici",
  "TipologiaFondazioni",
  "TipologiaGiunti",
  "TipologiaSezione",
  "TipologiaSpallaFinale",
  "TipologiaSpallaIniziale",
  "TipologiaStrutturale",
  "TipologiaStrutturaleAltro",
  "Tracciato",
  //"TrafficoMedioGiornalieroVeicoliCommerciali",
  //"TrafficoMedioGiornalieroVeicoliGiorno",
  //"UltimazioneEffettivoPresunto",
  //"agg",
  //"id",
  //"ispezioneId",
  //"key",
  //"name",
  "operaId",
  //"type",
];

//
// gruppi e gruppo
// solo se selezioni da firestore
//

// gruppi
/*
fsCrudGruppi.getAllItems().then((data) => {
  gruppi.value = data ? data : [];
});
*/
</script>

<template>
  <div class="layoutOpera">
    <div class="flex gap-1 justify-left">
      <Button
        icon="pi pi-home"
        variant="text"
        rounded
        aria-label="Home"
        :disabled="disabled"
        @click="scheda = null"
      />
      <Select
        v-model="scheda"
        :options="schede"
        optionLabel="label"
        placeholder="Select a scheda"
        class="w-30 md:w-56"
      />
      <span class="mt-2">({{ schede.length }})</span>
    </div>

    <Divider />

    <!-- scheda -->
    <div v-if="scheda">
      <!-- L0 Censimento -->
      <L0Censimento
        v-if="scheda.type === 'L0'"
        v-model="scheda"
        :disabled="disabled"
      />
      <!-- L1 Ispezione -->
      <L1Ispezione
        v-if="scheda.type === 'L1'"
        v-model="scheda"
        :disabled="disabled"
      />
      <!-- L1 Difettosita -->
      <L1Difettosita
        v-if="scheda.hasOwnProperty('l1valutazioneId')"
        v-model="scheda"
        :disabled="disabled"
      />
      <!-- CASF -->
      <CASF
        v-if="scheda.type === 'CASF'"
        v-model="scheda"
        :disabled="disabled"
      />
      <!-- CARS -->
      <CARS
        v-if="scheda.type === 'CARS'"
        v-model="scheda"
        :disabled="disabled"
      />
      <!-- debug -->
      <div v-if="u.debug()" class="m-2 p-2">
        <VueJsonPretty
          :data="
            Object.keys(scheda)
              .sort() // Sort the keys alphabetically
              .reduce((obj:any, key) => {
                obj[key] = scheda[key]; // Rebuild the object with sorted keys
                return obj;
              }, {})
          "
          theme="dark"
          :showIcon="true"
          :showDoubleQuotes="false"
          :showLength="true"
          :deep="1"
        />
      </div>
    </div>
    <!-- opera > home -->
    <div v-else>
      <!-- opera > home > json -->
      <VueJsonPretty
        :data="opera"
        theme="dark"
        :showIcon="true"
        :showDoubleQuotes="false"
        :showLength="true"
        :deep="1"
      />
    </div>
  </div>
</template>

<style scoped>
.layoutOpera {
  display: block !important;
  width: 100%;
  height: calc(100vh - 10rem);
  overflow-y: auto;
  text-align: left;
  padding: 0.5rem;
}

.tri {
  border: 0.1em solid;
  border-radius: 0.3em;

  width: 100%;
  height: 100%;
}
</style>
