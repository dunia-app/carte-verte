import { fakerFR as faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import csv from 'csv';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from "path";
import { Readable } from "stream";
import { RedisService } from "../../../../../infrastructure/redis/redis.service";
import { Address } from "../../../../../libs/ddd/domain/value-objects/address.value-object";
import { UUID } from "../../../../../libs/ddd/domain/value-objects/uuid.value-object";
import { buildTypedServices, createTestModule } from "../../../../../tests/test_utils";
import { MerchantOrganizationRepository } from "../../../database/merchant-organization/merchant-organization.repository";
import { MerchantOrganizationEntity } from "../../../domain/entities/merchant-organization.entity";
import { MerchantModule } from "../../../merchant.module";
import { MatchMerchantOrganizationCommand } from "../match-merchant-organization.command";
import { matchMerchantOrganization } from "../match-merchant-organization.service";

const WRITE_CSV = false ;
jest.setTimeout(30000);

describe('matchMerchantOrganization', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    merchantOrganizationRepo: MerchantOrganizationRepository,
  })

  // The matching ratio expected
  const expectedRatioTruePositive = 0.5;
  const expectedRatioFalsePositive = 0.3;

  // Above this time, we consider that the transaction will fail
  const maxTimeAllowed = 300;

  const expectedAverageTime = 100;

  // Define a type for the matching function for clarity
  type MatchFunction = (
    command : MatchMerchantOrganizationCommand, 
    merchantOrganizationRepo: MerchantOrganizationRepository, 
    city_threshold? : number,
    name_threshold? : number
  ) => Promise<MerchantOrganizationEntity[]>;

  // Type for a matching record
  type MatchingRecord = {
    merchantName: string,
    merchantCity: string,
    brandName: string,
    organizationName: string,
    organizationCity: string,
  }

  type MerchantOrganizationRecord = {
    brandName: string,
    organizationName: string,
    organizationCity: string,
  }

  let allMerchantsRecords : MatchingRecord[] = [];

  let allCommands : MatchMerchantOrganizationCommand[] = [];

  function loadRecords(csvName : string) : MatchingRecord[] {
    const fullPath = path.join(__dirname, csvName);

    const content = fs.readFileSync(fullPath)
    const csvRecords = parse(content, {fromLine: 2});

    const records : MatchingRecord[] = csvRecords.map((record : any) => ({
      merchantName: record[0],
      merchantCity: record[1],
      brandName: record[2],
      organizationName: record[3],
      organizationCity: record[4],    
    }));

    return records ;
  }

  function loadMerchantOrganizationsRecords(csvName : string) : MerchantOrganizationRecord[] {
    const fullPath = path.join(__dirname, csvName);

    const content = fs.readFileSync(fullPath)
    const csvRecords = parse(content, {fromLine: 2});

    const records : MerchantOrganizationRecord[] = csvRecords.map((record : any) => ({
      brandName: record[0],
      organizationName: record[1],
      organizationCity: record[2],    
    }));

    return records ;
  }

   // Create a list of commands from the merchant data
  function createCommands(merchantNames : string[], merchantCities : string[]) : MatchMerchantOrganizationCommand[] {
    const commands : MatchMerchantOrganizationCommand[] = Array.from({length: merchantNames.length}, (_, i) => new MatchMerchantOrganizationCommand({
      merchantCity: merchantCities[i],
      merchantName: merchantNames[i],
    }));

    return commands ;
  }

  // Create and save merchant organizations in the database
  // Most of the data is random, but we only use the brandName, organizationName and city
  async function createAndSaveMerchantOrganizations(
    merchantOrganizationBrandNames : string[],
    merchantOrganizationNames : string[],
    merchantOrganizationCities : string[],
    ) : Promise<void>
  {
    const nbMerchants = merchantOrganizationBrandNames.length;

    const merchantOrganizationRepo = services.merchantOrganizationRepo;

    const merchantOrganizations : MerchantOrganizationEntity[] = Array.from({length: nbMerchants}, (_, i) => new MerchantOrganizationEntity({
        id: new UUID(faker.string.uuid()),
        props: {
            siret: faker.string.numeric(14),
            cntrRegistrationNumber: faker.string.numeric(10),
            brandName: merchantOrganizationBrandNames[i] ? merchantOrganizationBrandNames[i] : faker.company.name(),
            organizationName: merchantOrganizationNames[i] ? merchantOrganizationNames[i] : faker.company.name(),
            naf: faker.string.alphanumeric(4),
            imageLinks: [],
            address: new Address({
                city: merchantOrganizationCities[i] ? merchantOrganizationCities[i] : faker.location.city(), 
                postalCode: faker.location.zipCode(),
                street: faker.location.street(),
            }),
            affiliationInvitationSent: 0,
        },
    }));


    await merchantOrganizationRepo.saveMultiple(merchantOrganizations);
  }

  // Check if the test data is correct
  // Create the commands and save the merchant organizations in the database
  async function checkAndArrange(
    merchantRecords : MatchingRecord[]
  ) : Promise<[MatchMerchantOrganizationCommand[]]>
  {
    const commands = createCommands(
      merchantRecords.map(( mR => mR.merchantName)),
      merchantRecords.map(( mR => mR.merchantCity))
    );
  
    await createAndSaveMerchantOrganizations(
      merchantRecords.map(( mR => mR.brandName)), 
      merchantRecords.map(( mR => mR.organizationName)), 
      merchantRecords.map(( mR => mR.organizationCity)), 
    );
  
    return[commands];
  }

  // Test the given matching algorithm from the commands
  // Return the number of matches, the maximum execution time and the average execution time
  async function testMerchantOrganizationMatching(
    matchFunction: MatchFunction,
    commands : MatchMerchantOrganizationCommand[],
    name_threshold?: number
  ): Promise<[number[], MerchantOrganizationEntity[][]]> {

      const nbMerchants = commands.length;
      const redis = services.redis;
      const merchantOrganizationRepo = services.merchantOrganizationRepo;

      // Number of matches
      let nbMatch : number = 0;

      let maxExecutionTime : number = 0;

      let matches : MerchantOrganizationEntity[][] = [];

      let executionTimes : number[] = [];

      // Act

      for (let i = 0; i < nbMerchants; i++) {
        let start = new Date().getTime();

        const matching = await matchFunction(commands[i], merchantOrganizationRepo, name_threshold);

        let end = new Date().getTime();
        let executionTime = end - start;

        executionTimes.push(executionTime)

        maxExecutionTime = Math.max(maxExecutionTime, executionTime);

        if (matching.length >= 1) {
          nbMatch++;
          matches.push(matching);
        }else{
          matches.push([]);
        }
      }

      return [executionTimes, matches];
  }

  type CSVData = (string | number)[][];

  function writeCSV(data: CSVData, fileName: string) : Promise<void> {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(__dirname, fileName)

      // Create a write stream
      const writableStream = fs.createWriteStream(fullPath);
  
      // Create a readable stream from the data
      const readableStream = Readable.from(data);
  
      // Run the pipeline
      readableStream
        // Convert arrays into a CSV stream
        .pipe(csv.stringify({
          delimiter: ',',
          quoted: false
        }))
        // Write the CSV stream to a file
        .pipe(writableStream);
  
      // Handle the 'finish' event
      writableStream.on('finish', () => {
        console.log(`CSV file '${fileName}' has been written successfully`);
        resolve();
      });
  
      // Handle any errors
      writableStream.on('error', (err) => {
        console.error(`Error writing CSV file '${fileName}':`, err);
        reject(err);
      });
    });
  }

  function isMerchantOrganizationMatching(
    matchingRecord: MatchingRecord, 
    moEntity : MerchantOrganizationEntity
  ): boolean
  {
    return (
      matchingRecord.brandName == moEntity.brandName && 
      matchingRecord.organizationName == moEntity.organizationName &&
      matchingRecord.organizationCity == moEntity.address.city
    )
  }

  function countNbTruePositives(matchingRecords : MatchingRecord[], matches : MerchantOrganizationEntity[][]): number {
    let nbCorrectMatching = 0;

    for(let i = 0 ; i < matches.length ; i++){
      if (matches[i].length > 0 && isMerchantOrganizationMatching(matchingRecords[i], matches[i][0])) {
        nbCorrectMatching++;
      }
    }

    return nbCorrectMatching;
  }

  function countNbFalsePositives(matches : MerchantOrganizationEntity[][]): number {
    let nbFalsePositives = 0;

    for(let i = 0 ; i < matches.length ; i++){
      if (matches[i].length > 1) {
        nbFalsePositives++;
      }
    }

    return nbFalsePositives;
  }

  function getRandomIndices(length: number, count: number): number[] {
    const indices: number[] = [];
    const availableIndices = Array.from({ length }, (_, i) => i); // Create an array with indices from 0 to length - 1
  
    while (indices.length < count) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
      indices.push(selectedIndex);
    }
  
    return indices;
  }

  type TestResult = {
    city_threshold: number,
    name_threshold: number,
    true_positives_ratio: number,
    false_positives_ratio: number,
    total_execution_time: number
  }

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [MerchantModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()

    allMerchantsRecords = loadRecords('mmo_all_merchants.csv')
    const [allCommandsArray] = await checkAndArrange(allMerchantsRecords);
    allCommands = allCommandsArray ;
  });

  beforeEach(async () => {
    await services.redis.flushCache()
  })

  it('all_merchants_matching', async() => {
    const sampleSize = 400 ;

    //400 values is a big enough sample for a population of 19000
    const randomIndices = getRandomIndices(allMerchantsRecords.length, sampleSize);
    const randomCommands = randomIndices.map(index => allCommands[index])
    const randomMerchantRecords = randomIndices.map(index => allMerchantsRecords[index])

    const [newExecutionTimes, newMatches] = await testMerchantOrganizationMatching(matchMerchantOrganization, randomCommands);

    const nbTruePositives = countNbTruePositives(randomMerchantRecords, newMatches);
    const nbFalsePositives = countNbFalsePositives(newMatches)

    const truePositiveData: CSVData = [
      [
        'merchantName', 
        'merchantCity', 
        'expectedBrandName', 
        'expectedOrganizationName', 
        'expectedOrganizationCity', 
        'obtainedBrandName',
        'obtainedOrganizationName',
        'obtainedOrganizationCity',
        'matchingResult',
        'executionTimeMs',
      ],
      ...randomCommands.map(
        (c, i) => [
          c.merchantName, 
          c.merchantCity, 
          randomMerchantRecords[i].brandName,
          randomMerchantRecords[i].organizationName,
          randomMerchantRecords[i].organizationCity,
          newMatches[i].length > 0 ? newMatches[i][0].brandName : '',
          newMatches[i].length > 0 ? newMatches[i][0].organizationName : '',
          newMatches[i].length > 0 ? newMatches[i][0].address.city : '',
          newMatches[i].length > 0 && isMerchantOrganizationMatching(randomMerchantRecords[i], newMatches[i][0]) ? 'true' : 'false',
          newExecutionTimes[i],
        ]
      )
    ]

    const falsePositiveData : CSVData = [
      [
        'merchantName', 
        'merchantCity', 
        'obtainedBrandName',
        'obtainedOrganizationName',
        'obtainedOrganizationCity',
        'matchingResult',
        'executionTimeMs',
      ],
      ...randomCommands.map(
        (c, i) => [
          c.merchantName, 
          c.merchantCity, 
          newMatches[i].length > 1 ? newMatches[i][1].brandName : '',
          newMatches[i].length > 1 ? newMatches[i][1].organizationName : '',
          newMatches[i].length > 1 ? newMatches[i][1].address.city : '',
          newMatches[i].length > 1 ? 'true' : 'false',
          newExecutionTimes[i],
        ]
      )
    ]

    if (WRITE_CSV) {await writeCSV(truePositiveData, '400_merchants_matching_true_positives.csv')}
    if (WRITE_CSV) {await writeCSV(falsePositiveData, '400_merchants_matching_false_positives.csv')}

    const averageTime = newExecutionTimes.reduce((a, b) => a + b, 0) / sampleSize;
    const maxTime = Math.max(...newExecutionTimes)

    const truePositivesRatio = nbTruePositives/sampleSize;
    const falsePositivesRatio = nbFalsePositives/sampleSize;

    expect(truePositivesRatio).toBeGreaterThanOrEqual(expectedRatioTruePositive);
    expect(falsePositivesRatio).toBeLessThanOrEqual(expectedRatioFalsePositive);
    expect(maxTime).toBeLessThanOrEqual(maxTimeAllowed);
    expect(averageTime).toBeLessThanOrEqual(expectedAverageTime);
  })

  afterAll(async () => {
    await app.close();
  });

});