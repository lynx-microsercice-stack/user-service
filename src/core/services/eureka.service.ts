import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as Eureka from 'eureka-js-client';
import configuration from 'src/config/configuration';

@Injectable()
export class EurekaService implements OnModuleInit, OnModuleDestroy {
  private client: Eureka;

  onModuleInit() {
    const eurekaHost = configuration().eureka.host;
    const eurekaPort = configuration().eureka.port;
    const hostName = configuration().host;
    const ipAddr = '172.0.0.1'; // This should be your actual IP address
    const port = configuration().port;

    this.client = new Eureka.Eureka({
      instance: {
        app: 'user-service',
        hostName,
        ipAddr,
        port: {
          '@enabled': true,
          $: port,
        },
        vipAddress: 'user-service',
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
        registerWithEureka: true,
        fetchRegistry: true,
        leaseRenewalIntervalInSeconds: 30,
        heartbeatIntervalInSeconds: 30,
      },
      eureka: {
        host: eurekaHost,
        port: eurekaPort,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 2000,
      },
    });

    this.client.start((error) => {
      if (error) {
        console.error('Error registering with Eureka:', error);
      } else {
        console.log('Successfully registered with Eureka');
      }
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.stop();
      console.log('Stopped Eureka client');
    }
  }

  /**
   * Get a service instance from Eureka
   */
  async getInstance(serviceName: string): Promise<any> {
    const instances = this.client.getInstancesByAppId(serviceName);
    if (!instances || instances.length === 0) {
      return null;
    }
    return instances[0];
  }
}
