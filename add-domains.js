// Script to add the domain portfolio to the database
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// List of domains to add
const domains = [
  "24arbitrage.com",
  "2fgroup.com",
  "3zly.com",
  "5gworld.com",
  "acmai.com",
  "admoby.com",
  "adventera.com",
  "ai-seo.com",
  "aiagentcompany.com",
  "aibanned.com",
  "aicolorist.com",
  "aicryptoverse.com",
  "aidestination.com",
  "aihorses.com",
  "aihunted.com",
  "aihustlers.com",
  "aipixo.com",
  "airebels.com",
  "aitextchecker.com",
  "aitextlab.com",
  "ajaxamsterdam.com",
  "alharir.com",
  "allgreenplants.com",
  "analyzeseo.com",
  "animalio.com",
  "animextrem.com",
  "animour.com",
  "animurals.com",
  "anotherplumber.com",
  "antiraid.com",
  "askjimmy.com",
  "asofar.com",
  "atlantaoptometrist.com",
  "atoservice.com",
  "augustaprinting.com",
  "augustatraining.com",
  "automationmailing.com",
  "axtoken.com",
  "babygrok.com",
  "baseballballs.com",
  "bergelectronics.com",
  "betscoin.com",
  "bigprospect.com",
  "blurtokens.com",
  "bobtools.com",
  "bollsen.com",
  "bostongraphicdesign.com",
  "boysly.com",
  "braincorner.com",
  "brc21.com",
  "brelix.com",
  "bremertonplumber.com",
  "brinksy.com",
  "burlingtonestates.com",
  "carletter.com",
  "carunlockingservices.com",
  "catcaves.com",
  "celatis.com",
  "celeblab.com",
  "charlestonfarm.com",
  "chatgptbots.com",
  "chatgpttools.com",
  "cheapcloset.com",
  "cinematronix.com",
  "climania.com",
  "climatiseurs.com",
  "climatservice.com",
  "codinggarden.com",
  "codycodes.com",
  "coiins.com",
  "coinhacking.com",
  "comixai.com",
  "connectivebusiness.com",
  "consulens.com",
  "cryptoinvestai.com",
  "cyberlabtech.com",
  "cyphere.com",
  "dakarinfo.com",
  "dentalto.com",
  "desktopgpt.com",
  "digitalarchiveservices.com",
  "digitalbusinesspartner.com",
  "dogeswap.com",
  "dogtrainingplan.com",
  "dollarsbot.com",
  "domusservice.com",
  "donelec.com",
  "druckladen.com",
  "dubaidomain.com",
  "earnezy.com",
  "easybank.org",
  "easymachining.com",
  "easyvitamin.com",
  "ecomovil.com",
  "egyptcomputer.com",
  "ekonect.com",
  "ekotoner.com",
  "elevels.com",
  "elonai.com",
  "elonmask.com",
  "embowed.com",
  "emergencyvehiclerepair.com",
  "etherbots.com",
  "evaflight.com",
  "explainablexai.com",
  "extraforma.com",
  "ezdatarecovery.com",
  "fairdomain.com",
  "fastlocks.com",
  "fastwebsite.net",
  "firstcold.com",
  "fiskalia.com",
  "flatwight.com",
  "flouss.com",
  "flyek.com",
  "fobros.com",
  "foodqr.com",
  "freshmasks.com",
  "frostfan.com",
  "fullunlock.com",
  "furnitar.com",
  "fxanime.com",
  "galaxycarpetcleaning.com",
  "galaxyconcept.com",
  "galaxyvoip.com",
  "gamefixing.com",
  "gensparkai.com",
  "ghayt.com",
  "globaldigitals.com",
  "globalopus.com",
  "globalrulesai.com",
  "globaltradeinc.com",
  "goosites.com",
  "gotravaux.com",
  "gpsline.com",
  "gr00t.com",
  "greenminingservices.com",
  "greenscreenbox.com",
  "guideforsuccess.com",
  "helixcars.com",
  "hellocryptocoin.com",
  "helloshoes.com",
  "herbasale.com",
  "highchips.com",
  "homelystore.com",
  "homeyland.com",
  "hostego.com",
  "hrify.com",
  "humanmachineinterfaces.com",
  "ichrak.com",
  "idblocker.com",
  "idealbebe.com",
  "idelivery.xyz",
  "illumicati.com",
  "immservice.com",
  "innovaplanet.com",
  "insourcia.com",
  "insuremydrone.com",
  "internetbrain.com",
  "iprogreen.com",
  "iptvhd.com",
  "irenov.com",
  "israelinside.com",
  "istitmar.com",
  "ittisal.com",
  "jarvice.com",
  "jayfoundation.com",
  "kingarab.com",
  "kinkston.com",
  "kit4cars.com",
  "kittentoken.com",
  "klikprint.com",
  "laboland.com",
  "labottegaitaliana.com",
  "lakome.com",
  "leonevents.com",
  "lilyscleaning.com",
  "littlelogo.com",
  "luminik.com",
  "lunarlips.com",
  "macklan.com",
  "magimag.com",
  "maklai.com",
  "mangagalaxy.com",
  "mangoseo.com",
  "marbellaholidayapartments.com",
  "massango.com",
  "maxigear.com",
  "maxisalon.com",
  "mcshirt.com",
  "mechvent.com",
  "meetpulse.com",
  "megaconsultants.com",
  "megajukebox.com",
  "megastickers.com",
  "megavelo.com",
  "megopay.com",
  "melbournehousecleaners.com",
  "melbourneofficefurniture.com",
  "memphisdev.com",
  "mengadgets.com",
  "metalligence.com",
  "mimouna.com",
  "minaexport.com",
  "miningchain.com",
  "minisupers.com",
  "mobildialysis.com",
  "mokimoki.com",
  "monarchitecte.com",
  "mortgagedynamics.com",
  "movingbusinesses.com",
  "muralwallpaper.com",
  "muscada.com",
  "myaccountingservices.com",
  "myaitools.com",
  "mydigitalproduct.com",
  "myhri.com",
  "mysolutionist.com",
  "mystarting.com",
  "mytechpoint.com",
  "neokeys.com",
  "neonmirrors.com",
  "nftmafia.com",
  "nhass.com",
  "notaryloan.com",
  "novastake.com",
  "nxtiptv.com",
  "nycfloor.com",
  "offiicial.com",
  "ohmycall.com",
  "oncopilot.com",
  "onlinedivorceforms.com",
  "onlinesmartphone.com",
  "onlinewritingservices.com",
  "ontariopropertymanagement.com",
  "ontariorealestatelawyer.com",
  "panamahostel.com",
  "panamainvesting.com",
  "papatoken.com",
  "parfumpourfemme.com",
  "payrollabc.com",
  "pcagents.com",
  "pepacoin.com",
  "permisfacile.com",
  "phonenumbergenerator.com",
  "pixelsaga.com",
  "printable3d.com",
  "printsly.com",
  "profimix.com",
  "profisy.com",
  "programgenerator.com",
  "prolabtech.com",
  "promalab.com",
  "punkape.com",
  "puptoken.com",
  "quickpopup.com",
  "rankito.com",
  "ranxter.com",
  "recyval.com",
  "restak.com",
  "roials.com",
  "romarley.com",
  "royalfilmperformance.com",
  "royalsecurityservices.com",
  "s0ft.com",
  "safaribike.com",
  "sangocoin.com",
  "saverium.com",
  "savewithai.com",
  "scanator.com",
  "secondhandlaptop.com",
  "shopifast.com",
  "smartagentx.com",
  "smartbraid.com",
  "smartgreencity.com",
  "smartylamps.com",
  "smsprotect.com",
  "snoringmedicine.com",
  "softcandle.com",
  "soracharacter.com",
  "soraediting.com",
  "souqalarab.com",
  "speedyautomation.com",
  "spicebazar.com",
  "spiderhoodie.com",
  "spincoinmaster.com",
  "spirittraders.com",
  "spliq.com",
  "stampad.com",
  "storelik.com",
  "storeshipper.com",
  "storinator.com",
  "superarchi.com",
  "sushitai.com",
  "sydneysunglasses.com",
  "t4h.com",
  "takemyname.com",
  "techrobotic.com",
  "techub.xyz",
  "techvidia.com",
  "techyshop.com",
  "tempmailgenerator.com",
  "testadsl.com",
  "texasdiscountfurniture.com",
  "texiko.com",
  "textileroof.com",
  "thedigitalvoice.com",
  "thehorse.org",
  "thesmarterhouse.com",
  "tigerlogistic.com",
  "todoclick.com",
  "travelyn.com",
  "trentonroofers.com",
  "triolingo.com",
  "truthgtp.com",
  "tsconsultant.com",
  "uniurl.com",
  "universconsulting.com",
  "universphoto.com",
  "unknownproduction.com",
  "urlazy.com",
  "usabakeries.com",
  "usedcarskilleen.com",
  "usedelectricauto.com",
  "v3.xyz",
  "vanillasea.com",
  "vey.io",
  "videozy.com",
  "vipgadget.com",
  "vipnumberstore.com",
  "volomax.com",
  "votira.com",
  "votrelogo.com",
  "wareztv.com",
  "waxhawplumber.com",
  "web3ton.com",
  "webfacture.com",
  "webgrafic.com",
  "webrobo.com",
  "websiteanalytic.com",
  "wedelo.com",
  "willevent.com",
  "wittygame.com",
  "worldjoker.com",
  "xbitcoinclub.com",
  "xchpool.com",
  "xfloki.com",
  "xplainify.com",
  "yaqouta.com",
  "yementelecom.com",
  "yourmelody.com",
  "zcach.com",
  "zomclub.com",
  "zoneplumbing.com"
];

// Function to randomly assign categories
function getRandomCategory() {
  const categories = ['Technology', 'Business', 'Finance', 'Health', 'Entertainment', 'Education'];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Function to generate a random price between min and max
function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }

    console.log(`Connecting to database: ${process.env.DATABASE_URL}`);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Process domains in smaller batches to avoid timeouts
    const BATCH_SIZE = 50;
    const totalDomains = domains.length;
    const startIndex = parseInt(process.argv[2] || '0');
    const endIndex = Math.min(startIndex + BATCH_SIZE, totalDomains);
    
    console.log(`Processing domains ${startIndex + 1} to ${endIndex} (of ${totalDomains})...`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = startIndex; i < endIndex; i++) {
      const domainName = domains[i];
      try {
        // Check if domain already exists
        const existingDomain = await pool.query('SELECT * FROM domains WHERE name = $1', [domainName]);
        
        if (existingDomain.rows.length > 0) {
          console.log(`Domain ${domainName} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Generate domain data
        const length = domainName.split('.')[0].length;
        const category = getRandomCategory();
        const price = getRandomPrice(500, 5000);
        const description = `Premium ${category.toLowerCase()} domain for your business. ${domainName} is a short, memorable domain name with only ${length} characters.`;
        
        // Insert domain
        await pool.query(
          'INSERT INTO domains (name, description, price, category, length, view_count, is_sold, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [domainName, description, price, category, length, 0, false, new Date()]
        );
        
        inserted++;
        console.log(`Added domain: ${domainName} (${inserted} domains added in this batch)`);
      } catch (err) {
        console.error(`Error adding domain ${domainName}:`, err);
      }
    }
    
    console.log(`Batch complete! Added ${inserted} new domains. Skipped ${skipped} existing domains.`);
    console.log(`Processed ${endIndex} of ${totalDomains} domains.`);
    
    if (endIndex < totalDomains) {
      console.log(`To process the next batch, run: node add-domains.js ${endIndex}`);
    } else {
      console.log('All domains have been processed!');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();