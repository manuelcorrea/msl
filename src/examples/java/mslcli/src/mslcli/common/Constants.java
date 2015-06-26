/**
 * Copyright (c) 2014 Netflix, Inc.  All rights reserved.
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

package mslcli.common;

/**
 * Misc. constants.
 *
 * @author Vadim Spector <vspector@netflix.com>
 */

public final class Constants {
    /** MSL control timeout in milliseconds. */
    public static final int TIMEOUT_MS = 120 * 1000;

   // key exchange type names used as command / user entry options
    public static final String KX_DH   = "dh" ; // Diffie-Hellman             Key Exchange
    public static final String KX_SWE  = "sw" ; // Symmetric  Wrapped         Key Exchange
    public static final String KX_AWE  = "aw" ; // Asymmetric Wrapped         Key Exchange
    public static final String KX_JWEL = "jwe"; // JSON Web Encryption Ladder Key Exchange
    public static final String KX_JWKL = "jwk"; // JSON Web Key        Ladder Key Exchange
}
