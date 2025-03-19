import {
    describe,
    it,
    expect,
    runTests,
    getSuites,
    AE
} from 'kt-testing-suite-ts';
import { KT } from 'kt-core';
import { MyPlugin } from '../index';

describe('MyPlugin Tests', () => {
    it('should be able to create a new instance of MyPlugin', () => {
        const plugin = new MyPlugin();
        expect(plugin).toBeInstanceOf(MyPlugin);
    });
});
