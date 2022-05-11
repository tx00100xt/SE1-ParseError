/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

616
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Firework.h"
#define RAND_05 (FLOAT(rand())/RAND_MAX-0.5f)
#define LAUNCH_SPEED 32.0f
%}

class CFireworks : CRationalEntity {
name      "Fireworks";
thumbnail "Thumbnails\\Eruptor.tbn";
features  "IsTargetable", "HasName";

properties:
 
 1 RANGE   m_rRndRadius        "Random radius" = 40.0f,
 10 CSoundObject m_soFly,       
 11 CSoundObject m_soExplosion, 
 12 FLOAT m_tmActivated=0.0f,

 20 CTString m_strName        "Name" 'N' ="",

 50 FLOAT m_tmLastAnimation=0.0f,

 60 FLOAT m_fRndGravity = 1.0f,
 61 INDEX m_iRnd = 0,
 63 INDEX m_iFireworkType = 0,
 64 BOOL  m_bMultiColored = FALSE,
 65 BOOL  m_bSpawnNew = FALSE,
 66 INDEX m_ctNewSpawns = 0,
 67 INDEX m_ctSpawned = 0,
 68 COLOR m_colColor = C_WHITE,
 69 ANGLE3D m_aRndAngle = ANGLE3D(0.0f, 0.0f, 0.0f),
 70 FLOAT3D m_vRndPos = FLOAT3D(0,0,0),
 71 FLOAT3D m_vWindDirection = FLOAT3D(0,0,0),
 72 FLOAT m_fLaunchSpeed = 1.0f,
 73 FLOAT m_fLaunchSpeed2 = 1.0f,
 74 FLOAT m_fLaunchSpeed3 = 1.0f,

{
  CEmiter2 m_emEmiter;
}

components:

 1 model   MODEL_MARKER     "Models\\Editor\\Axis.mdl",
 2 texture TEXTURE_MARKER   "Models\\Editor\\Vector.tex",
 3 sound   SOUND_FLY        "Sounds\\FWWhistle01.wav",
 4 sound   SOUND_EXPLODE		"Sounds\\FWExplosion01.wav",
 5 sound   SOUND_EXPLODE1   "ModelsMP\\Enemies\\Summoner\\Sounds\\Explode.wav",
 6 sound   SOUND_EXPLODE2		"Sounds\\FWExplosion02.wav",
 7 sound   SOUND_EXPLODE3   "SoundsMP\\Misc\\Firecrackers.wav",
 8 class   CLASS_FIREWORK   "Classes\\Firework.ecl",

functions:
  void Read_t( CTStream *istr) // throw char *
  { 
    CRationalEntity::Read_t(istr);
    m_emEmiter.Read_t(*istr);
  }
  
  void Write_t( CTStream *istr) // throw char *
  { 
    CRationalEntity::Write_t(istr);
    m_emEmiter.Write_t(*istr);
  }
 
  void RenderParticles(void)
  {
		/*if (m_iFireworkType==0) {
			return;
		}*/
    FLOAT tmNow = _pTimer->CurrentTick();
    if( tmNow>m_tmLastAnimation)
    {
			if (m_iFireworkType==0) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*(3.0f+m_fRndGravity);
			} else if (m_iFireworkType==1) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*3.0f;
			} else if (m_iFireworkType==2) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*(3.0f+m_fRndGravity);
			} else if (m_iFireworkType==3) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*m_fRndGravity;
			} else if (m_iFireworkType==4) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*m_fRndGravity;
			} else if (m_iFireworkType==5) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*(3.0f+m_fRndGravity);
			} else if (m_iFireworkType==6) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)+m_vWindDirection*m_fRndGravity;
			} else if (m_iFireworkType==7) {
				m_emEmiter.em_vG = m_emEmiter.GetGravity(this)*m_fRndGravity;
			} else {
				FLOAT fRatio=CalculateRatio(m_tmActivated-tmNow,0.0f,6.0f,1,0);
				FLOAT fGPower=(Min(fRatio,0.5f)-0.5f)*2.0f*10.0f;
				m_emEmiter.em_vG = FLOAT3D(0, fGPower, 0);
			}	
			
      m_emEmiter.AnimateParticles();
      m_tmLastAnimation=tmNow;
      
      for(INDEX i=0; i<m_emEmiter.em_aepParticles.Count(); i++)
      {
        CEmittedParticle2 &ep=m_emEmiter.em_aepParticles[i];
        if(ep.ep_tmEmitted<0) {continue;};
        FLOAT fLiving=tmNow-ep.ep_tmEmitted;
        FLOAT fSpeed=0.0f;

				if (m_bSpawnNew) {
					if (ep.ep_bPrimary && tmNow>ep.ep_tmEmitted+ep.ep_tmLife-0.05f) {
						m_ctNewSpawns++;
						if (m_iFireworkType==4) {
							SpawnFirework4A(ep.ep_vPos);
						} else if (m_iFireworkType==0) {
							SpawnFirework0A(ep.ep_vPos);
						}
						//CPrintF("Spawn new Particle %d, m_ctNewSpawns %d\n", i, m_ctNewSpawns);
						if (m_ctNewSpawns>=m_ctSpawned) {
							m_bSpawnNew = FALSE;
						}
					}
				}

        if( fLiving>=6.0f)
        {
          fSpeed=0.0f;
        }
        else
        {
          //fSpeed=(0.996f+0.387f*fLiving-0.158f*fLiving*fLiving)*LAUNCH_SPEED;
					if (ep.ep_bPrimary) {
						fSpeed=(1.77f*pow(0.421f,fLiving))*m_fLaunchSpeed;
					} else {
						fSpeed=(1.77f*pow(0.421f,fLiving))*m_fLaunchSpeed2;
					}
          /*
          FLOAT fSpeedRatio=1.0f-(Clamp(fLiving,2.0f,4.0f)-2.0f)/2.0f;
          fSpeed=fSpeedRatio*LAUNCH_SPEED;
          */
        }
        FLOAT3D vNormalized=ep.ep_vSpeed;
        vNormalized.Normalize();
        ep.ep_vSpeed=vNormalized*(4.0f+fSpeed);
      }
    }
    m_emEmiter.RenderParticles();
  }

	// upwards spray
	void SpawnFirework0(void)
	{
		m_soExplosion.Set3DParameters(500.0f, 100.0f, 0.4f, 1.0f);
    PlaySound(m_soExplosion, SOUND_EXPLODE2, 0);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 16.0f+FRnd()*16.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 12;
		m_ctSpawned = ctSparks;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.5f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*1.0f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, 2.0f+RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	void SpawnFirework0A(FLOAT3D vPos)
	{
		m_soExplosion.Set3DParameters(500.0f, 100.0f, 0.25f, 1.0f);
    PlaySound(m_soExplosion, SOUND_EXPLODE, 0);

    // add emited firework sparks   
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed2 = 20.0f+FRnd()*20.0f;
		FLOAT fRndExtra = 2.0f-FRnd()*1.0f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 12;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=3.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, FALSE);
    }
	}

	// upwards spray
/*	void SpawnFirework0(void)
	{
		m_soExplosion.Set3DParameters(500.0f, 100.0f, 0.4f, 1.0f);
    PlaySound(m_soExplosion, SOUND_EXPLODE2, 0);

    // add emited firework sparks
    FLOAT3D vRndPos = FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos = GetPlacement().pl_PositionVector+vRndPos;
    CEntity *pen = NULL;    
    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 16.0f+FRnd()*16.0f*8;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    INDEX ctSparks = 12;
		m_ctSpawned = ctSparks;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth = tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife = 1.5f+RAND_05*1.0f;
      FLOAT fSize = (1.0f+RAND_05*0.25f)*1.0f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, 2.0f+RAND_05, RAND_05)*fRndExtra;
      vSpeed = vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed = RAND_05*360.0f;      
      COLOR col = m_colColor|CT_OPAQUE;

      pen = CreateEntity(CPlacement3D(vPos, ANGLE3D(0,0,0)), CLASS_FIREWORK);
			ESpawnFirework eSpawn;
			eSpawn.col = col;
			eSpawn.fSize = fSize;
			pen->Initialize(eSpawn);
			CMovableEntity *penP = (CMovableEntity*)(CFirework*)pen;
			((CMovableEntity&)*penP).LaunchAsFreeProjectile(vSpeed, penP);
    }
	}

	void SpawnFirework0A(FLOAT3D vPos)
	{
		m_soExplosion.Set3DParameters(500.0f, 100.0f, 0.25f, 1.0f);
    PlaySound(m_soExplosion, SOUND_EXPLODE, 0);

    // add emited firework sparks   
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed2 = 20.0f+FRnd()*20.0f;
		FLOAT fRndExtra = 2.0f-FRnd()*1.0f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 12;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=3.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, FALSE);
    }
	}*/

	// tons of particles, 2 diff types
	void SpawnFirework1(void)
	{
		PlayExplosionSound(0);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 8.0f+FRnd()*16.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 384;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=3.0f+RAND_05;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.6f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra*2.0;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		m_fLaunchSpeed = 8.0f+FRnd()*16.0f;
		fRndExtra = 1.0f-FRnd()*0.5f;
		ctSparks = IRnd()%16+32;
    for( INDEX iSpark2=0; iSpark2<ctSparks; iSpark2++)
    {
      FLOAT tmBirth=tmNow+(iSpark2+RAND_05)*_pTimer->TickQuantum/ctSparks*4.0f;
      FLOAT fLife=2.5f+RAND_05;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*1.1f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	// your standard everyday variety, size just about right, less particles than above
	void SpawnFirework2(void)
	{
		PlayExplosionSound(1);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 16.0f+FRnd()*16.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    m_tmActivated=tmNow;
    INDEX ctSparks = IRnd()%96+56;
		
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth = tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife = 3.0f+RAND_05*2.0f;
      FLOAT fStretch = (1.0f+RAND_05*0.25f)*0.8f;
      FLOAT3D vSpeed = FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;//LAUNCH_SPEED;
      FLOAT fRotSpeed = RAND_05*360.0f;      
      COLOR col = m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = IRnd()%8+16;
    for( INDEX iSpark2=0; iSpark2<ctSparks; iSpark2++)
    {
      FLOAT tmBirth=tmNow+(iSpark2+RAND_05)*_pTimer->TickQuantum/ctSparks*4.0f;
      FLOAT fLife=3.0f+RAND_05*2.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*1.0f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;//LAUNCH_SPEED;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col = m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	// 2 circles, may need less gravity :p
	void SpawnFirework3(void)
	{
		PlayExplosionSound(2);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=(INDEX) (FRnd()*16);
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 16.0f+FRnd()*8.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    COLOR col=AdjustGamma( m_colColor, -20.0f)|CT_OPAQUE;
    m_tmActivated=tmNow;
    INDEX ctSparks = 36;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
			FLOAT fA = iSpark*10.0f;
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=2.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.8f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 1+RAND_05, SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;;
      FLOAT fRotSpeed=RAND_05*360.0f;      

      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 24;
    for( INDEX iSpark2=0; iSpark2<ctSparks; iSpark2++)
    {
			FLOAT fA = iSpark2*15.0f;
      FLOAT tmBirth=tmNow+(iSpark2+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=2.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.85f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 2+RAND_05, SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f; 
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 12;
    for( INDEX iSpark3=0; iSpark3<ctSparks; iSpark3++)
    {
			FLOAT fA = iSpark3*30.0f;
      FLOAT tmBirth=tmNow+(iSpark3+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=2.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 3+RAND_05, SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;;
      FLOAT fRotSpeed=RAND_05*360.0f; 
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 8;
    for( INDEX iSpark4=0; iSpark4<ctSparks; iSpark4++)
    {
			FLOAT fA = iSpark4*45.0f;
      FLOAT tmBirth=tmNow+(iSpark4+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=2.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.95f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 4+RAND_05, SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f; 
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 4;
    for( INDEX iSpark5=0; iSpark5<ctSparks; iSpark5++)
    {
			FLOAT fA = iSpark5*45.0f;
      FLOAT tmBirth=tmNow+(iSpark5+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=2.0f+RAND_05*1.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*1.0f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 5+RAND_05, SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f; 
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	// shoots them around randomly, then spawns new firework on death (SpawnFirework4A)
	void SpawnFirework4(void)
	{
		PlayExplosionSound(0);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 15.0f+FRnd()*15.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*0.5f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 9;
		m_ctSpawned = ctSparks;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.5f+RAND_05;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*1.0f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	void SpawnFirework4A(FLOAT3D vPos)
	{   
		// add emited firework sparks
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed2 = 8.0f+FRnd()*8.0f;
		FLOAT fRndExtra = 1.0f-FRnd()*1.0f;
    m_tmActivated=tmNow;
    INDEX ctSparks = 16;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.0f+RAND_05;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.8f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, FALSE);
    }
	}

	// magic mushrooms
	void SpawnFirework5(void)
	{
		PlayExplosionSound(1);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 20.0f+FRnd()*14.0f;
		//FLOAT fRndExtra = 1.0f-FRnd()*0.25f;
		COLOR col=m_colColor|CT_OPAQUE;
    m_tmActivated=tmNow;
		// main circle
    INDEX ctSparks = 48;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
			FLOAT fA = iSpark*7.5f;
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.3f+RAND_05*0.5f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.7f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 3+RAND_05, SinFast(fA))*4.0f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;  
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		// eyes
		ctSparks = 40;
    for( INDEX iSpark2=0; iSpark2<ctSparks; iSpark2++)
    {
			FLOAT fA = iSpark2*9.0f;
      FLOAT tmBirth=tmNow+(iSpark2+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.3f+RAND_05*0.5f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.7f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 2+RAND_05, SinFast(fA))*4.0f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 36;
    for( INDEX iSpark3=0; iSpark3<ctSparks; iSpark3++)
    {
			FLOAT fA = iSpark3*10.0f;
      FLOAT tmBirth=tmNow+(iSpark3+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.3f+RAND_05*0.5f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.7f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), 1+RAND_05, SinFast(fA))*4.0f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f; 
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		ctSparks = 16;
    for( INDEX iSpark4=0; iSpark4<ctSparks; iSpark4++)
    {
			FLOAT fA = iSpark4*22.5f;
      FLOAT tmBirth=tmNow+(iSpark4+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.3f+RAND_05*0.5f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.7f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), -2+RAND_05, SinFast(fA))*3.0f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	// some funky shit
	void SpawnFirework6(void)
	{
		PlayExplosionSound(2);

    // add emited firework sparks
    FLOAT3D vRndPos = FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
		m_vRndPos = vRndPos;
    FLOAT3D vPos = GetPlacement().pl_PositionVector+vRndPos;
		FLOATmatrix3D mRot;
		m_aRndAngle = ANGLE3D(FRnd()*45.0f, FRnd()*45.0f, FRnd()*45.0f);
		MakeRotationMatrixFast(mRot, m_aRndAngle);
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;
    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 12.0f+FRnd()*5.0f;
		FLOAT fRndExtra = FRnd()*0.5f;
		COLOR col=m_colColor|CT_OPAQUE;
    m_tmActivated=tmNow;
    INDEX ctSparks = IRnd()%48+48;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
			FLOAT fA = iSpark*(360.0f/ctSparks);
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.2f+fRndExtra;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.8f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), RAND_05*0.1f, SinFast(fA))/2;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;   
      m_emEmiter.AddParticle(vPos, vSpeed*mRot, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
	}

	// some funky shit
	void SpawnFirework6A(void)
	{
		PlayExplosionSound(3);

    // add emited firework sparks
    FLOAT3D vRndPos = m_vRndPos;
    FLOAT3D vPos = GetPlacement().pl_PositionVector+vRndPos;
		FLOATmatrix3D mRot;
		MakeRotationMatrixFast(mRot, m_aRndAngle);
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed2 = 10.0f+FRnd()*2.0f;
		FLOAT fRndExtra = FRnd()*0.5f;
		COLOR col=m_colColor|CT_OPAQUE;
    m_tmActivated=tmNow;
    INDEX ctSparks = IRnd()%64+96;//IRnd()%16+16;
    /*for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
			FLOAT fA = iSpark*(360.0f/ctSparks);
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=1.0f+fRndExtra;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( CosFast(fA), RAND_05*0.1f, SinFast(fA))/2;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;   
      m_emEmiter.AddParticle(vPos, vSpeed*mRot, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, FALSE);
    }*/

    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*4.0f;
      FLOAT fLife=2.5f+RAND_05;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( RAND_05, RAND_05, RAND_05)*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, FALSE);
    }
	}

	void SpawnFirework7(void)
	{
    PlayExplosionSound(1);

    // add emited firework sparks
    FLOAT3D vRndPos=FLOAT3D( RAND_05, RAND_05, RAND_05)*m_rRndRadius;
    FLOAT3D vPos=GetPlacement().pl_PositionVector+vRndPos;
    
    m_emEmiter.em_vG=FLOAT3D(0,0,0);
    m_emEmiter.em_iGlobal=FRnd()*16;
    m_emEmiter.em_colGlobal=C_WHITE|CT_OPAQUE;

    FLOAT tmNow = _pTimer->CurrentTick();
		m_fLaunchSpeed = 8.0f+FRnd()*8.0f;
		FLOAT fRndExtra = 3.0f-FRnd();
    m_tmActivated=tmNow;
    INDEX ctSparks = 24;
    for( INDEX iSpark=0; iSpark<ctSparks; iSpark++)
    {
			FLOAT fA = iSpark*15.0f;
      FLOAT tmBirth=tmNow+(iSpark+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=4.0f+RAND_05*2.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.95f;
      FLOAT3D vSpeed=FLOAT3D( 1, TanFast(fA), SinFast(fA))*fRndExtra;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch, col, TRUE);
    }
		m_fLaunchSpeed2 = 10.0f+FRnd()*10.0f;
		ctSparks = 36;
    for( INDEX iSpark2=0; iSpark2<ctSparks; iSpark2++)
    {
			FLOAT fA = iSpark2*10.0f;
      FLOAT tmBirth=tmNow+(iSpark2+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=4.0f+RAND_05*2.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.92f;
      FLOAT3D vSpeed=FLOAT3D( 2, -TanFast(fA), -SinFast(fA))*fRndExtra*0.75f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed2;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch*0.5f, col, FALSE);
    }
		m_fLaunchSpeed3 = 12.0f+FRnd()*12.0f;
		ctSparks = 48;
    for( INDEX iSpark3=0; iSpark3<ctSparks; iSpark3++)
    {
			FLOAT fA = iSpark3*7.5f;
      FLOAT tmBirth=tmNow+(iSpark3+RAND_05)*_pTimer->TickQuantum/ctSparks*2.0f;
      FLOAT fLife=4.0f+RAND_05*2.0f;
      FLOAT fStretch=(1.0f+RAND_05*0.25f)*0.9f;
      FLOAT3D vSpeed=FLOAT3D( 3, -TanFast(fA), -SinFast(fA))*fRndExtra*0.5f;
      vSpeed=vSpeed.Normalize()*m_fLaunchSpeed3;
      FLOAT fRotSpeed=RAND_05*360.0f;      
      COLOR col=m_colColor|CT_OPAQUE;
      m_emEmiter.AddParticle(vPos, vSpeed, RAND_05*360.0f, fRotSpeed, tmBirth, fLife, fStretch*0.5f, col, FALSE);
    }
	}

	void PlayExplosionSound(INDEX iSound)
	{

		if (iSound==0) {
			m_soExplosion.Set3DParameters(1500.0f, 1000.0f, 0.5f, 1.0f);
			PlaySound(m_soExplosion, SOUND_EXPLODE1, 0);
		} else if (iSound==1) {
		m_soExplosion.Set3DParameters(1500.0f, 1000.0f, 0.1f, 1.0f);
			PlaySound(m_soExplosion, SOUND_EXPLODE2, 0);
		} else {
			m_soExplosion.Set3DParameters(1500.0f, 1000.0f, 0.75f, 1.0f);
			PlaySound(m_soExplosion, SOUND_EXPLODE3, 0);
		}
	}

	void ShootInitialProjectile0(void)
	{

	}

procedures:

  SpawnFireworks0()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework0();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.3f);
			SpawnFirework0();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.3f);
			SpawnFirework0();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.3f);
			SpawnFirework0();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.3f);
			SpawnFirework0();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.3f);
			SpawnFirework0();
		}*/

		autowait(8.0f);
    return EEnd();
  }

  SpawnFireworks1()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework1();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.3f);
			SpawnFirework1();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.3f);
			SpawnFirework1();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.3f);
			SpawnFirework1();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.3f);
			SpawnFirework1();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.3f);
			SpawnFirework1();
		}*/

		autowait(5.0f);
    return EEnd();
  }

  SpawnFireworks2()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework2();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.3f);
			SpawnFirework2();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.3f);
			SpawnFirework2();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.3f);
			SpawnFirework2();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.3f);
			SpawnFirework2();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.3f);
			SpawnFirework2();
		}*/

		autowait(5.0f);
    return EEnd();
  }

  SpawnFireworks3()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework3();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}

		if (m_iRnd>=6) {
			autowait(FRnd()*0.3f);
			SpawnFirework3();
		}*/


		autowait(6.0f);
    return EEnd();
  }

  SpawnFireworks4()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework4();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=6) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=7) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}

		if (m_iRnd>=8) {
			autowait(FRnd()*0.1f);
			SpawnFirework4();
		}*/

		autowait(12.0f);
    return EEnd();
  }

  SpawnFireworks5()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework5();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}

		if (m_iRnd>=6) {
			autowait(FRnd()*0.1f+0.1f);
			SpawnFirework5();
		}*/

		autowait(10.0f);
    return EEnd();
  }

  SpawnFireworks6()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework6();
		autowait(FRnd()*0.1f+0.2f);
		SpawnFirework6A();

		m_iRnd = IRnd()%4;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		/*if (m_iRnd>=4) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		if (m_iRnd>=6) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}

		if (m_iRnd>=7) {
			autowait(FRnd()*0.3f);
			SpawnFirework6();
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework6A();
		}*/

		autowait(8.0f);
    return EEnd();
  }

  SpawnFireworks7()
  {
    //PlaySound(m_soFly, SOUND_FLY, 0);
    autowait(0.1f+FRnd()*0.2f);

    SpawnFirework7();

		m_iRnd = IRnd()%3;

		if (m_iRnd>=1) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		if (m_iRnd>=2) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		/*if (m_iRnd>=3) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		if (m_iRnd>=3) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		if (m_iRnd>=5) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		if (m_iRnd>=6) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}

		if (m_iRnd>=7) {
			autowait(FRnd()*0.1f+0.2f);
			SpawnFirework7();
		}*/

		autowait(6.0f);
    return EEnd();
  }

  Main()
  {
    // init model
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);
    GetModelObject()->StretchModel(FLOAT3D(4.0f, 4.0f, 4.0f));

    autowait(_pTimer->TickQuantum);

    m_emEmiter.Initialize(this);

		//m_iFireworkType = 6;
		//m_bMultiColored = TRUE;
		//m_colColor = 0x4B2F8600;

		if (m_iFireworkType==0) {
			m_bSpawnNew = TRUE;
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS01;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS00;
			}
		} else if (m_iFireworkType==1) {
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS05;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS04;
			}
		} else if (m_iFireworkType==2) { // needs work : p
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS03;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS02;
			}
		} else if (m_iFireworkType==3) {
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS09;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS08;
			}
		} else if (m_iFireworkType==4) {
			m_bSpawnNew = TRUE;
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS07;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS06;
			}
		} else if (m_iFireworkType==5) {
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS09;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS08;
			}
		} else if (m_iFireworkType==6) {
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS09;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS08;
			}
		} else if (m_iFireworkType==7) {
			if (m_bMultiColored) {
				m_emEmiter.em_et2Type=ET_FIREWORKS09;
			} else {
				m_emEmiter.em_et2Type=ET_FIREWORKS08;
			}
    } else {
			m_emEmiter.em_et2Type=ET_FIREWORKS02;
		}

		//CPrintF("m_iFireworkType: %d, m_bMultiColored: %d\n", m_iFireworkType, m_bMultiColored);

    // wait to be triggered
    wait() {
      on (EBegin) : {
				if (m_iFireworkType==0) {
					m_fRndGravity = FRnd()*1.0f;
					call SpawnFireworks0();
				} else if (m_iFireworkType==1) {
					m_fRndGravity = 0.0f;
					call SpawnFireworks1();
				} else if (m_iFireworkType==2) {
					m_fRndGravity = FRnd()*8.0f;
					call SpawnFireworks2();
				} else if (m_iFireworkType==3) {
					m_fRndGravity = FRnd()*5.0f;
					call SpawnFireworks3();
				} else if (m_iFireworkType==4) {
					m_fRndGravity = FRnd()*1.0f;
					call SpawnFireworks4();
				} else if (m_iFireworkType==5) {
					m_fRndGravity = FRnd()*8.0f;
					call SpawnFireworks5();
				} else if (m_iFireworkType==6) {
					m_fRndGravity = FRnd()*1.0f;
					call SpawnFireworks6();
				} else if (m_iFireworkType==7) {
					m_fRndGravity = FRnd()*5.0f;
					call SpawnFireworks7();
				} else {
					m_fRndGravity = FRnd();
					call SpawnFireworks0();
				}
				resume;
      }
			on (EEnd) : { stop; }
      otherwise (): { resume; }
    }

		//CPrintF("Firework EEnd\n");

		Destroy();

    return;
  }
};

