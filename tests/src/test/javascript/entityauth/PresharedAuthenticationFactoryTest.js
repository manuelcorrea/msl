/**
 * Copyright (c) 2012-2014 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Pre-shared keys entity authentication factory unit tests.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */
describe("PresharedAuthenticationFactory", function() {
    /** MSL encoder format. */
    var ENCODER_FORMAT = MslEncoderFormat.JSON;
    
    /** Key entity identity. */
    var KEY_IDENTITY = "identity";

    /** Authentication utilities. */
    var authutils = new MockAuthenticationUtils();
    /** Entity authentication factory. */
    var factory;
    /** MSL context. */
    var ctx;
    /** MSL encoder factory. */
    var encoder;
    
    var initialized = false;
    beforeEach(function() {
        if (!initialized) {
            runs(function() {
                MockMslContext$create(EntityAuthenticationScheme.PSK, false, {
                    result: function(c) { ctx = c; },
                    error: function(e) { expect(function() { throw e; }).not.toThrow(); }
                });
            });
            waitsFor(function() { return ctx; }, "ctx", 100);
            runs(function() {
                encoder = ctx.getMslEncoderFactory();
                var store = new MockKeySetStore();
                store.addKeys(MockPresharedAuthenticationFactory.PSK_ESN, MockPresharedAuthenticationFactory.KPE, MockPresharedAuthenticationFactory.KPH, MockPresharedAuthenticationFactory.KPW);
                factory = new PresharedAuthenticationFactory(store, authutils);
                ctx.addEntityAuthenticationFactory(factory);
                initialized = true;
            });
            waitsFor(function() { return initialized; }, "static initialization", 100);
        }
    });
    
    afterEach(function() {
        authutils.reset();
    });
    
    it("createData", function () {
        var data = new PresharedAuthenticationData(MockPresharedAuthenticationFactory.PSK_ESN);
        var entityAuthMo;
        runs(function() {
            data.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { entityAuthMo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return entityAuthMo; }, "entityAuthMo", 100);
        
        var authdata;
        runs(function() {
            factory.createData(ctx, entityAuthMo, {
                result: function(x) { authdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return authdata; }, "authdata", 100);

        var dataMo, authdataMo;
        runs(function() {
            expect(authdata).not.toBeNull();
            expect(authdata instanceof PresharedAuthenticationData).toBeTruthy();
            
            MslTestUtils.toMslObject(encoder, data, {
                result: function(x) { dataMo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
            MslTestUtils.toMslObject(encoder, authdata, {
                result: function(x) { authdataMo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return dataMo && authdataMo; }, "dataMo && authdataMo", 100);

        runs(function() {
            expect(MslEncoderUtils$equalObjects(dataMo, authdataMo)).toBeTruthy();
        });
    });
    
    it("encode exception", function() {
        var entityAuthMo;
        runs(function() {
	        var data = new PresharedAuthenticationData(MockPresharedAuthenticationFactory.PSK_ESN);
	        data.getAuthData(encoder, ENCODER_FORMAT, {
	            result: function(x) { entityAuthMo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
	        });
        });
        waitsFor(function() { return entityAuthMo; }, "entityAuthMo", 100);
        
        var exception;
        runs(function() {
	        entityAuthMo.remove(KEY_IDENTITY);
	        factory.createData(ctx, entityAuthMo, {
                result: function() {},
                error: function(e) { exception = e; },
	        });
        });
    	waitsFor(function() { return exception; }, "exception", 100);
    	
    	runs(function() {
    	    var f = function() { throw exception; };
    	    expect(f).toThrow(new MslEncodingException(MslError.MSL_PARSE_ERROR));
    	});
    });
    
    it("crypto context", function() {
        var data = new PresharedAuthenticationData(MockPresharedAuthenticationFactory.PSK_ESN);
        var cryptoContext = factory.getCryptoContext(ctx, data);
        expect(cryptoContext).not.toBeNull();
    });
    
    it("unknown ESN", function() {
    	var f = function() {
	        var data = new PresharedAuthenticationData(MockPresharedAuthenticationFactory.PSK_ESN2);
	        factory.getCryptoContext(ctx, data);
    	};
    	expect(f).toThrow(new MslEntityAuthException(MslError.ENTITY_NOT_FOUND));
    });
    
    it("revoked", function() {
        var f = function() {
            authutils.revokeEntity(MockPresharedAuthenticationFactory.PSK_ESN);
            var data = new PresharedAuthenticationData(MockPresharedAuthenticationFactory.PSK_ESN);
            factory.getCryptoContext(ctx, data);
        };
        expect(f).toThrow(new MslEntityAuthException(MslError.ENTITY_REVOKED));
    });
});
